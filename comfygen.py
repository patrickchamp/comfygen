# comfygen.py

"""
Defines the mappings required by ComfyUI to recognize custom nodes.
In this specific project, ComfyGen Studio doesn't define any *backend* custom nodes
that perform image generation tasks directly within Python. Its primary function
is to provide a custom web UI.

Therefore, these mappings are typically empty unless you were adding
Python-based custom nodes as part of this package.
"""

# Dictionary mapping internal node class names to their Python class implementations.
# e.g., NODE_CLASS_MAPPINGS = { "MyCustomNode": MyCustomNodeClass }
NODE_CLASS_MAPPINGS = {}

# Dictionary mapping internal node class names to their display names in the ComfyUI editor.
# e.g., NODE_DISPLAY_NAME_MAPPINGS = { "MyCustomNode": "My Fancy Node" }
NODE_DISPLAY_NAME_MAPPINGS = {}

# If this custom node *did* have Python code, you might also see:
# __all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']
# to explicitly export these dictionaries for ComfyUI discovery.