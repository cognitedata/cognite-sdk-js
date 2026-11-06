# /// script
# requires-python = ">=3.10"
# dependencies = ["pytest"]
# ///
"""Offline tests for openapi_tag.py: uv run --with pytest pytest test_openapi_tag.py"""

import sys

import pytest

import openapi_tag
from openapi_tag import Schema, render_fields, type_str

SPEC: Schema = {
    "openapi": "3.1.0",
    "paths": {
        "/widgets/{widgetId}/call": {
            "parameters": [
                {
                    "in": "path",
                    "name": "widgetId",
                    "required": True,
                    "schema": {"type": "integer"},
                },
                {"in": "query", "name": "mode", "schema": {"type": "string"}},
            ],
            "post": {
                "tags": ["Widgets"],
                "operationId": "callWidget",
                "summary": "Call a widget",
                "parameters": [
                    {
                        "in": "query",
                        "name": "mode",
                        "required": True,
                        "schema": {"const": "fast"},
                    }
                ],
                "requestBody": {"$ref": "#/components/requestBodies/WidgetCall"},
                "responses": {
                    "200": {"$ref": "#/components/responses/WidgetList"},
                    "400": {"$ref": "#/components/responses/Error"},
                },
            },
        },
        "/widgets/delete": {
            "post": {
                "tags": ["Widgets"],
                "responses": {
                    "200": {
                        "description": "Inline response",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {"deleted": {"type": "integer"}},
                                }
                            }
                        },
                    }
                },
            }
        },
        "/gadgets": {
            "get": {
                "tags": ["Gadgets"],
                "responses": {"204": {"description": "No content"}},
            }
        },
    },
    "components": {
        "requestBodies": {
            "WidgetCall": {
                "content": {
                    "application/json": {
                        "schema": {"$ref": "#/components/schemas/WidgetCall"}
                    }
                }
            }
        },
        "responses": {
            "WidgetList": {
                "content": {
                    "application/json": {
                        "schema": {"$ref": "#/components/schemas/WidgetList"}
                    }
                }
            },
            "Error": {
                "content": {
                    "application/json": {
                        "schema": {"$ref": "#/components/schemas/Error"}
                    }
                }
            },
        },
        "schemas": {
            "WidgetCall": {
                "type": "object",
                "properties": {"data": {"type": "object"}},
            },
            "WidgetList": {
                "type": "object",
                "properties": {
                    "items": {
                        "type": "array",
                        "items": {"$ref": "#/components/schemas/Widget"},
                    }
                },
            },
            "Widget": {"type": "object", "properties": {"id": {"type": "integer"}}},
            "Error": {"type": "object"},
        },
    },
}


@pytest.mark.parametrize(
    ("schema", "expected"),
    [
        ({"$ref": "#/components/schemas/Widget"}, "Widget"),
        ({"type": ["string", "null"]}, "string | null"),
        ({"type": ["array", "null"], "items": {"type": "integer"}}, "integer[] | null"),
        ({"const": "fast"}, '"fast"'),
        ({"enum": ["a", None]}, '"a" | null'),
        ({"type": "integer", "format": "int64"}, "integer(int64)"),
        ({"type": "string", "format": "date-time"}, "string(date-time)"),
        ({"format": "binary"}, "string(binary)"),
        ({"description": "no type", "items": {"type": "string"}}, "string[]"),
        ({"minimum": 0, "maximum": 10}, "number"),
        ({"additionalProperties": {"type": "string"}}, "Record<string, string>"),
        (
            {
                "type": "array",
                "items": {"oneOf": [{"type": "string"}, {"type": "integer"}]},
            },
            "(string | integer)[]",
        ),
        (
            {
                "allOf": [
                    {"description": "Annotation only."},
                    {"$ref": "#/components/schemas/Widget"},
                ]
            },
            "Widget",
        ),
        (
            {
                "type": "object",
                "properties": {},
                "anyOf": [{"required": ["a"]}, {"required": ["b"]}],
            },
            "object",
        ),
        ({"description": "Untyped."}, "any"),
    ],
)
def test_type_str(schema: Schema, expected: str) -> None:
    assert type_str(schema) == expected


def test_render_fields_includes_inline_parts_and_required_alternatives() -> None:
    schema = {
        "type": "object",
        "allOf": [
            {"$ref": "#/components/schemas/Status"},
            {
                "type": "object",
                "required": ["jobId"],
                "properties": {"jobId": {"type": "integer"}},
            },
        ],
        "anyOf": [{"required": ["points"]}, {"required": ["box"]}],
    }

    assert render_fields(schema, "  ", describe=False) == [
        "  anyOf: requires points",
        "  anyOf: requires box",
        "  allOf: object",
        "    jobId: integer",
    ]


def run_main(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str], tag: str
) -> str:
    monkeypatch.setattr(openapi_tag, "load_spec", lambda version, refresh: SPEC)
    monkeypatch.setattr(sys, "argv", ["openapi_tag.py", tag])
    openapi_tag.main()
    return capsys.readouterr().out


def test_main_renders_tag(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    assert run_main(monkeypatch, capsys, "Widgets").splitlines() == (
        [
            "# Widgets (20230101)",
            "",
            "## Endpoints",
            "",
            "### POST /widgets/{widgetId}/call",
            "  operationId: callWidget",
            "  summary: Call a widget",
            "  path param widgetId: integer",
            '  query param mode: "fast"',
            "  request body: WidgetCall",
            "    data?: object",
            "  response 200: WidgetList",
            "",
            "### POST /widgets/delete",
            "  operationId: -",
            "  summary: -",
            "  response 200: object",
            "    deleted?: integer",
            "",
            "## Schemas",
            "",
            "### WidgetCall",
            "  data?: object",
            "",
            "### WidgetList",
            "  items?: Widget[]",
            "",
            "### Error",
            "  = object",
            "",
            "### Widget",
            "  id?: integer",
            "",
        ]
    )


def test_main_renders_empty_response(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    assert "  response 204: (empty)" in run_main(monkeypatch, capsys, "Gadgets")


def test_main_suggests_similar_tag(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    with pytest.raises(SystemExit, match="Did you mean: Widgets"):
        run_main(monkeypatch, capsys, "widget")
