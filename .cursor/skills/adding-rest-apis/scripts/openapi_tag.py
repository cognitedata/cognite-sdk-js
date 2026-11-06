# /// script
# requires-python = ">=3.10"
# ///
"""Print the endpoints and schemas of one tag in the Cognite OpenAPI document.

Usage:
    uv run openapi_tag.py --list-tags
    uv run openapi_tag.py Transformations
    uv run openapi_tag.py Transformations --descriptions
    uv run openapi_tag.py "Data products" --version 20230101-beta
"""

import argparse
import gzip
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from tempfile import gettempdir
from typing import Any

SPEC_URL = "https://storage.googleapis.com/cognitedata-api-docs/dist/{version}.json"
CACHE_MAX_AGE_SECONDS = 24 * 60 * 60
HTTP_METHODS = ("get", "post", "put", "patch", "delete")
GZIP_MAGIC = b"\x1f\x8b"

Schema = dict[str, Any]


def load_spec(version: str, refresh: bool) -> Schema:
    cache = Path(gettempdir()) / f"cognite-openapi-{version}.json"
    is_fresh = (
        cache.exists() and time.time() - cache.stat().st_mtime < CACHE_MAX_AGE_SECONDS
    )
    if is_fresh and not refresh:
        return json.loads(cache.read_text(encoding="utf-8"))

    url = SPEC_URL.format(version=version)
    try:
        with urllib.request.urlopen(url, timeout=60) as response:
            body = response.read()
    except urllib.error.HTTPError as error:
        sys.exit(f"Could not download {url}: HTTP {error.code}")
    except urllib.error.URLError as error:
        sys.exit(f"Could not download {url}: {error.reason}")

    # The bucket serves the document gzip-encoded even without Accept-Encoding.
    if body[:2] == GZIP_MAGIC:
        body = gzip.decompress(body)
    raw = body.decode("utf-8")
    cache.write_text(raw, encoding="utf-8")
    return json.loads(raw)


def resolve(spec: Schema, node: Schema) -> Schema:
    ref = node.get("$ref")
    if not ref:
        return node
    target: Any = spec
    for part in ref.removeprefix("#/").split("/"):
        target = target[part]
    return target


def ref_name(ref: str) -> str:
    return ref.rsplit("/", 1)[-1]


def type_str(schema: Schema) -> str:
    if "$ref" in schema:
        return ref_name(schema["$ref"])
    if "enum" in schema:
        return " | ".join(json.dumps(value) for value in schema["enum"])
    for key, joiner in (("oneOf", " | "), ("anyOf", " | "), ("allOf", " & ")):
        if key in schema:
            return joiner.join(type_str(part) for part in schema[key])
    schema_type = schema.get("type")
    if schema_type == "array":
        inner = type_str(schema.get("items", {}))
        return f"({inner})[]" if " " in inner else f"{inner}[]"
    if schema_type == "object" or "properties" in schema:
        if "properties" in schema:
            return "object"
        extra = schema.get("additionalProperties")
        if isinstance(extra, dict):
            return f"Record<string, {type_str(extra)}>"
        return "object"
    if schema_type == "integer":
        return f"integer({schema['format']})" if "format" in schema else "integer"
    return str(schema_type or "any")


def annotations(schema: Schema) -> str:
    notes = []
    if schema.get("deprecated"):
        notes.append("DEPRECATED")
    if schema.get("readOnly"):
        notes.append("readOnly")
    if "default" in schema:
        notes.append(f"default={json.dumps(schema['default'])}")
    for key in ("minimum", "maximum", "minLength", "maxLength", "minItems", "maxItems"):
        if key in schema:
            notes.append(f"{key}={schema[key]}")
    return f"  [{', '.join(notes)}]" if notes else ""


def description_lines(schema: Schema, indent: str, describe: bool) -> list[str]:
    text = schema.get("description", "").strip()
    if not describe or not text:
        return []
    return [f"{indent}  # {line}" for line in text.splitlines() if line.strip()]


def render_properties(schema: Schema, indent: str, describe: bool) -> list[str]:
    required = set(schema.get("required", []))
    lines = []
    for name, prop in schema.get("properties", {}).items():
        optional = "" if name in required else "?"
        lines.append(f"{indent}{name}{optional}: {type_str(prop)}{annotations(prop)}")
        lines.extend(description_lines(prop, indent, describe))
        if "properties" in prop:
            lines.extend(render_properties(prop, indent + "  ", describe))
        items = prop.get("items", {})
        if "properties" in items:
            lines.extend(render_properties(items, indent + "  ", describe))
    return lines


def render_schema(name: str, schema: Schema, describe: bool) -> list[str]:
    lines = [
        f"### {name}{annotations(schema)}",
        *description_lines(schema, "", describe),
    ]
    if "properties" in schema:
        lines.extend(render_properties(schema, "  ", describe))
        return lines
    header_length = len(lines)
    for key in ("oneOf", "anyOf", "allOf"):
        for part in schema.get(key, []):
            lines.append(f"  {key}: {type_str(part)}")
            lines.extend(render_properties(part, "    ", describe))
    if len(lines) == header_length:
        lines.append(f"  = {type_str(schema)}")
    return lines


def collect_refs(node: Any, found: list[str]) -> None:
    if isinstance(node, dict):
        ref = node.get("$ref")
        if (
            isinstance(ref, str)
            and ref.startswith("#/components/schemas/")
            and ref not in found
        ):
            found.append(ref)
        for value in node.values():
            collect_refs(value, found)
    elif isinstance(node, list):
        for value in node:
            collect_refs(value, found)


def body_schema(spec: Schema, holder: Schema | None) -> Schema | None:
    if not holder:
        return None
    content = resolve(spec, holder).get("content", {})
    media = content.get("application/json") or next(iter(content.values()), None)
    return media.get("schema") if media else None


def render_operation(
    spec: Schema, method: str, path: str, operation: Schema, describe: bool
) -> list[str]:
    deprecated = "  [DEPRECATED]" if operation.get("deprecated") else ""
    lines = [
        f"### {method.upper()} {path}{deprecated}",
        f"  operationId: {operation.get('operationId', '-')}",
        f"  summary: {operation.get('summary', '-')}",
        *description_lines(operation, "", describe),
    ]
    for raw_param in operation.get("parameters", []):
        param = resolve(spec, raw_param)
        required = "" if param.get("required") else "?"
        schema = param.get("schema", {})
        lines.append(
            f"  {param.get('in')} param {param.get('name')}{required}: "
            f"{type_str(schema)}{annotations(schema)}"
        )
        lines.extend(description_lines(param, "  ", describe))
    request = body_schema(spec, operation.get("requestBody"))
    if request:
        lines.append(f"  request body: {type_str(request)}")
        lines.extend(render_properties(resolve(spec, request), "    ", describe))
    for status, response in operation.get("responses", {}).items():
        if not status.startswith("2"):
            continue
        schema = body_schema(spec, response)
        lines.append(
            f"  response {status}: {type_str(schema) if schema else '(empty)'}"
        )
    return lines


def tag_operations(spec: Schema, tag: str) -> list[tuple[str, str, Schema]]:
    operations = []
    for path, path_item in spec.get("paths", {}).items():
        for method in HTTP_METHODS:
            operation = path_item.get(method)
            if operation and tag in operation.get("tags", []):
                operations.append((method, path, operation))
    return operations


def all_tags(spec: Schema) -> list[str]:
    tags = {
        tag
        for path_item in spec.get("paths", {}).values()
        for method in HTTP_METHODS
        for tag in path_item.get(method, {}).get("tags", [])
    }
    return sorted(tags)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "tag", nargs="?", help="OpenAPI tag, as in the api-docs.cognite.com URL"
    )
    parser.add_argument(
        "--version",
        default="20230101",
        help="20230101, 20230101-beta or 20230101-alpha",
    )
    parser.add_argument(
        "--list-tags", action="store_true", help="list all tags and exit"
    )
    parser.add_argument("--refresh", action="store_true", help="ignore the cached spec")
    parser.add_argument(
        "--descriptions", action="store_true", help="include descriptions (for JSDoc)"
    )
    args = parser.parse_args()

    spec = load_spec(args.version, args.refresh)

    if args.list_tags or not args.tag:
        print("\n".join(all_tags(spec)))
        return

    operations = tag_operations(spec, args.tag)
    if not operations:
        matches = [tag for tag in all_tags(spec) if args.tag.lower() in tag.lower()]
        hint = (
            f" Did you mean: {', '.join(matches)}?" if matches else " Use --list-tags."
        )
        sys.exit(f"No operations with tag {args.tag!r} in {args.version}.{hint}")

    print(f"# {args.tag} ({args.version})\n\n## Endpoints\n")
    for method, path, operation in operations:
        print(
            "\n".join(
                render_operation(spec, method, path, operation, args.descriptions)
            ),
            end="\n\n",
        )

    refs: list[str] = []
    collect_refs([operation for _, _, operation in operations], refs)
    index = 0
    while index < len(refs):
        collect_refs(resolve(spec, {"$ref": refs[index]}), refs)
        index += 1

    print("## Schemas\n")
    for ref in refs:
        schema = resolve(spec, {"$ref": ref})
        print(
            "\n".join(render_schema(ref_name(ref), schema, args.descriptions)),
            end="\n\n",
        )


if __name__ == "__main__":
    main()
