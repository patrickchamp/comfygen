# __init__.py

"""
Initialization file for the ComfyGen Studio custom node package.

This script is executed by ComfyUI when loading custom nodes. Its main roles here are:
1. Importing necessary mappings (even if empty) from other files within the package.
2. Setting up the web server routes using aiohttp to serve the custom UI (HTML, CSS, JS).
3. Defining the web root directory for the custom UI files.
"""

# Import node mappings from comfygen.py (will be empty dictionaries in this case)
from .comfygen import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS

import os
import server # Import the ComfyUI server instance
from aiohttp import web # Import web server functionalities from aiohttp

# Define the web root directory for ComfyGen Studio's static files (HTML, CSS, JS)
# It's located in the 'web' subdirectory relative to this __init__.py file.
WEBROOT = os.path.join(os.path.dirname(os.path.realpath(__file__)), "web")

# --- Web Server Route Definitions ---
# We add routes to the existing ComfyUI server instance.

# Define a GET route for the main entry point of the ComfyGen Studio UI.
# When a user navigates to http://<your_comfyui_address>/comfygen,
# this function will serve the main index.html file.
@server.PromptServer.instance.routes.get("/comfygen")
async def comfygen_web_index(request): # Changed function name for clarity, make it async
    """Serves the main index.html file for the ComfyGen Studio UI."""
    index_path = os.path.join(WEBROOT, "index.html")
    if not os.path.exists(index_path):
        # Handle case where index.html is missing
        return web.Response(status=404, text="ComfyGen Studio index.html not found.")
    return web.FileResponse(index_path)

# Define static routes to serve CSS and JavaScript files.
# This allows the browser to request files like /comfygen/css/comfygen.css
# and have them served directly from the 'web/css' directory.
css_path = os.path.join(WEBROOT, "css")
js_path = os.path.join(WEBROOT, "js")

if os.path.isdir(css_path):
    server.PromptServer.instance.routes.static("/comfygen/css", css_path)
    print(f"Serving ComfyGen CSS from: {css_path}")
else:
    print(f"Warning: ComfyGen CSS directory not found at {css_path}")

if os.path.isdir(js_path):
    server.PromptServer.instance.routes.static("/comfygen/js", js_path)
    print(f"Serving ComfyGen JS from: {js_path}")
else:
    print(f"Warning: ComfyGen JS directory not found at {js_path}")


# Expose the node mappings for ComfyUI discovery (even though they are empty).
# This is standard practice for custom node packages.
__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']

print("--- ComfyGen Studio routes loaded ---")
print(f"Access UI at: /comfygen")
print("------------------------------------")