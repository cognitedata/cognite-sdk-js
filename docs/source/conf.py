# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
import os
import sys
import pathlib
import json
import os

#BASE_DIR = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
#with open(os.path.join(BASE_DIR, '../packages/stable/package.json')) as fp:
#    pkg = json.load(fp)

#sys.path.insert(0, os.path.abspath('../../'))
#sys.path.append(os.path.abspath('../../'))
#sys.path.append(os.path.abspath('..'))
#sys.path.append(os.path.abspath('/home/rodrigo-ubuntu/dev/workspaces/idea/cognite/cognite-sdk-js/packages/stable/src/cogniteClient'))
#sys.path.insert(0, os.path.abspath('../..'))
# sys.path.insert(0, os.path.abspath('../../packages.stable.src'))
# sys.path.insert(0, pathlib.Path(__file__).parents[2].resolve().as_posix())
# sys.path.append(os.path.abspath(
#     os.path.join(__file__, "../../packages")
# ))

BASE_DIR = os.path.dirname(os.path.dirname(os.path.realpath('.')))
print('BASE_DIR = ' + BASE_DIR)
sys.path

sys.path.insert(0, os.path.abspath('../../'))
sys.path.insert(1, os.path.abspath('..'))
sys.path.append(os.path.abspath('../../packages/stable'))
sys.path.append(os.path.abspath('../../packages/stable/src'))
sys.path.append(os.path.abspath('../../packages/stable/tsconfig.json'))
sys.path.append(os.path.abspath('../../tsconfig.json'))
print(sys.path)

# -- Project information -----------------------------------------------------

project = 'cognite-sdk-js'
copyright = '2022, Cognite'
author = 'Cognite'


# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.doctest',
    'sphinx.ext.intersphinx',
    'sphinx.ext.todo',
    'sphinx.ext.coverage',
    'sphinx.ext.mathjax',
    'sphinx.ext.ifconfig',
    'sphinx.ext.viewcode',
    'sphinx.ext.githubpages',
    'sphinx_js'
]

# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

# The suffix(es) of source filenames.
# You can specify multiple suffix as a list of string:
#
# source_suffix = ['.rst', '.md']
source_suffix = '.rst'

primary_domain = 'js'
js_language = 'typescript'
#js_source_path = os.path.join(BASE_DIR, '../packages/stable/src')
js_source_path = BASE_DIR + '/packages/stable/src'

print('JS SOURCE PATH = ' + js_source_path)

# The master toctree document.
master_doc = 'index'

# The version info for the project you're documenting, acts as replacement for
# |version| and |release|, also used in various other places throughout the
# built documents.
#
# The short X.Y version.
#version = pkg['version']
# The full version, including alpha/beta/rc tags.
#release = pkg['version']

# The name of the Pygments (syntax highlighting) style to use.
pygments_style = 'sphinx'

# If true, `todo` and `todoList` produce output, else they produce nothing.
todo_include_todos = False

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']


# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
#
html_theme = 'sphinx_rtd_theme'

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = ['_static']