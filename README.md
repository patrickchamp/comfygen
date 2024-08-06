# ComfyGen Studio: A Mobile-Friendly Web Interface for ComfyUI

ComfyGen Studio is a sleek and intuitive mobile interface for ComfyUI, designed to simplify your image generation workflow on the go. This project enhances the original ComfyUI with a user-friendly interface and additional features.

This fork of ComfyGen Studio was created to bypass the limitations of ComfyUI's node-based interface on mobile devices, providing a streamlined, touch-friendly way to use the Flux image generation model directly from iPhones and iPads without dealing with complex node arrangements.

## Table of Contents
- [Project Screenshots](#project-screenshots)
- [Setting Up ComfyGen Studio](#setting-up-comfygen-studio)
- [New Features and Enhancements](#new-features-and-enhancements)
- [Using the Default Flux Workflow](#using-the-default-flux-workflow)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Project Screenshots

![ComfyGen Studio Interface](./screenshots/UI.png)

## Setting Up ComfyGen Studio

### Prerequisites
- ComfyUI installed
- A compatible GPU (for optimal performance)
- Basic familiarity with ComfyUI workflows

To set up ComfyGen Studio using ComfyUI, follow these steps:

1. Clone or download this repository directly into the `custom_nodes` directory within ComfyUI.
2. Execute `run_nvidia_gpu.bat` or `run_cpu.bat` to start the ComfyUI server.
3. (Optional) Replace the default workflow:
   - Enable Dev Mode Options: Click on "Settings" in the ComfyUI interface to enable Dev Mode Options.
   - Generate Workflow JSON: Go back and click "Save (API Format)" to create a JSON for your workflow.
   - Replace Base Workflow: Replace `web/js/base_workflow.json` with your JSON to use your custom workflow.
4. Access ComfyGen Studio: Open your web browser and navigate to `http://<comfy_address>:<comfy_port>/comfygen` (e.g., http://127.0.0.1:8188/comfygen).

## New Features and Enhancements

ComfyGen Studio introduces several improvements to the original ComfyUI interface:

- **Responsive Design**: Optimized for mobile devices with a clean, card-based layout.
- **Image Size Control**: Presets and custom inputs for width and height.
- **Advanced Generation Settings**: Control steps and seed for image generation.
- **Image History**: Navigate through previously generated images.
- **Prompt Management**: Recent and favorite prompts lists for quick access.
- **Real-time Updates**: WebSocket integration for live progress tracking.

## Using the Default Flux Workflow

The default workflow is optimized for Flux. Here's what you need to know:

- **Performance**: On an RTX3070 8GB VRAM and 64GB RAM, expect 47-50 seconds per 512x512 prompt.

To set up Flux with ComfyUI:

1. Download the fp8 Model (not fp16) from [this link](https://huggingface.co/Kijai/flux-fp8/tree/main). Place it in the `/unet` folder.
2. Download the VAE from [this link](https://huggingface.co/black-forest-labs/FLUX.1-schnell/tree/main/vae). Rename "diffusion_pytorch_model.safetensors" to something like "flux-schnell.safetensors" and place it in the VAE folder.
3. Download the clips from [this link](https://huggingface.co/comfyanonymous/flux_text_encoders/tree/main). You need "clip_l.safetensors" and "t5xxl_fp8...safetensors". Place them in the clip folder.
4. Update/install missing nodes in ComfyUI and restart.
5. Note: Adding `--lowvram` as an argument in the run batch file may slow down performance.
6. Optional: You can also load the base_workflow.json from this project directly in the regular ComfyUI interface.

This setup is optimized for low-mid range GPUs. Adjust as necessary for your hardware.

## Troubleshooting

### Replacing the Default Workflow

If you want to use your own workflow instead of the default Flux workflow, follow these steps:

1. In ComfyUI, create your desired workflow.
2. Enable Dev Mode Options: Click on "Settings" in the ComfyUI interface to enable Dev Mode Options.
3. Generate Workflow JSON: Go back and click "Save (API Format)" to create a JSON for your workflow.
4. Replace the content of `web/js/base_workflow.json` with your newly generated JSON.
5. Open `web/js/app.js` and locate the following lines:

   ```javascript
   workflow['87']['inputs']['wildcard_text'] = text.replace(/(\r\n|\n|\r)/gm, ' ')
   workflow['34']['inputs']['noise_seed'] = currentSeed
   workflow['25']['inputs']['width'] = width
   workflow['25']['inputs']['height'] = height
   workflow['32']['inputs']['steps'] = steps
   ```

5. Update these lines to match the node IDs in your new workflow. For example, if your text input node where you normally enter your prompt in the workflow has ID '983', you would change the first line to:

   ```javascript
   workflow['983']['inputs']['text'] = text.replace(/(\r\n|\n|\r)/gm, ' ')
   ```

6. Make similar adjustments for other nodes (seed, width, height, steps) based on your workflow structure.

### Common Issues

1. **Changes not reflecting**: If you make changes to `app.js` they should take effect without restarting ComfyUI if you refresh the browser window. 

2. **Queue prompt not working**: Ensure that the node IDs in `app.js` exactly match those in your `base_workflow.json`. Even a small mismatch can prevent the prompt from being queued.

### Getting Help

If you're still experiencing issues:

1. Double-check that all file paths and node IDs are correct.
2. Consult the ComfyUI documentation for any specific node-related questions.

## Contributing

We welcome contributions to ComfyGen Studio! If you have suggestions or improvements, feel free to fork this repository and submit a pull request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Original ComfyUI project
- All contributors and users of ComfyGen Studio
- Flux model developers

## Maintenance

This project is not actively maintained. Updates are made for personal use and released periodically.