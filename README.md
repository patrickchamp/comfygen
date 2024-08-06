# ComfyGen Studio: A Mobile-Friendly Web Interface for ComfyUI

ComfyGen Studio is a sleek and intuitive mobile interface for ComfyUI, designed to simplify your image generation workflow on the go. This project enhances the original ComfyUI with a user-friendly interface and additional features.

This fork of ComfyGen Studio was created to bypass the limitations of ComfyUI's node-based interface on mobile devices, providing a streamlined, touch-friendly way to use the Flux image generation model directly from iPhones and iPads without dealing with complex node arrangements.

## Project Screenshots

![ComfyGen Studio Interface](./screenshots/UI.png)

## Setting Up ComfyGen Studio

To set up ComfyGen Studio using ComfyUI, follow these steps:

### 1. Clone or Download the Repository:
Clone or download this repository directly into the `custom_nodes` directory within ComfyUI.

### 2. Run the ComfyUI Server:
Execute `run_nvidia_gpu.bat` or `run_cpu.bat` to start the ComfyUI server.

### 3. Replace the Default Workflow (Optional):
The default workflow is optimized for Flux. If you want to use a different workflow:

- Enable Dev Mode Options: Click on "Settings" in the ComfyUI interface to enable Dev Mode Options.
- Generate Workflow JSON: Go back and click "Save (API Format)" to create a JSON for your workflow.
- Replace Base Workflow: Replace `web/js/base_workflow.json` with your JSON to use your custom workflow.

### 4. Access ComfyGen Studio:
Open your web browser and navigate to `http://<comfy_address>:<comfy_port>/comfygen` (e.g., http://127.0.0.1:8188/comfygen).

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

## Contributing

We welcome contributions to ComfyGen Studio! If you have suggestions or improvements, feel free to fork this repository and submit a pull request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Original ComfyUI project
- All contributors and users of ComfyGen Studio
- Flux model developers