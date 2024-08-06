// ComfyGen Studio is a sleek and intuitive mobile interface for ComfyUI, designed to simplify your image generation workflow on the go. Say goodbye to the clutter of nodes and complex configurations—this frontend streamlines your experience, making it easy to generate stunning images with just a few taps on your mobile device.
// When suggesting changes, only provide the sections that need to change and specify where to add them and or what to replace.
// Use an async IIFE to start the application
(async () => {
  const serverAddress = `${window.location.hostname}:${window.location.port}`
  const clientId = uuidv4()
  const socketUrl = `ws://${serverAddress}/ws?clientId=${clientId}`
  const workflow = await loadWorkflow()
  const promptElement = document.getElementById('prompt')
  const sendPromptButton = document.getElementById('send-prompt-button')
  const clearPromptButton = document.getElementById('clear-prompt-button')
  const mainBuildElement = document.getElementById('maingen')
  const progressBar = document.getElementById('main-progress')
  const imageWidthInput = document.getElementById('image-width')
  const imageHeightInput = document.getElementById('image-height')
  const imageSizePreset = document.getElementById('image-size-preset')
  const recentPromptsList = document.getElementById('recent-prompts-list')
  const favoritePromptsList = document.getElementById('favorite-prompts-list')
  const prevImageButton = document.getElementById('prev-image-button')
  const nextImageButton = document.getElementById('next-image-button')
  const imageCounter = document.getElementById('image-counter')
  const imageContainer = document.getElementById('image-container')
  const fullscreenImage = document.getElementById('fullscreen-image')
  const closeFullscreen = document.getElementById('close-fullscreen')
  const keepSeedCheckbox = document.getElementById('keep-seed')
  // At the beginning of your script
  let recentPrompts = []
  let favoritePrompts = []
  const maxRecentPrompts = 25
  let imageHistory = []
  let currentImageIndex = -1

  // Load the last prompt from localStorage
  const lastPrompt = localStorage.getItem('lastPrompt')
  if (lastPrompt) {
    promptElement.value = lastPrompt
  }

  // Update the progress bar
  function updateProgress(max = 0, value = 0) {
    progressBar.max = max
    progressBar.value = value
  }

  // Connect to WebSocket
  const socket = new WebSocket(socketUrl)
  socket.addEventListener('open', () => console.log('Connected to the server'))
  socket.addEventListener('message', handleSocketMessage)

  // Event listeners
  sendPromptButton.addEventListener('click', () => {
    const promptText = promptElement.value
    queuePromptWithText(promptText)
  })

  clearPromptButton.addEventListener('click', () => {
    promptElement.value = ''
    localStorage.removeItem('lastPrompt')
  })

  prevImageButton.addEventListener('click', showPreviousImage)
  nextImageButton.addEventListener('click', showNextImage)

  // Function to generate UUID
  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
  }

  // Function to load the workflow
  async function loadWorkflow() {
    const response = await fetch('/comfygen/js/base_workflow.json')
    return response.json()
  }

  const seedInput = document.getElementById('seed-input')
  let currentSeed = Math.floor(Math.random() * 9999999999)

  function updateSeedDisplay() {
    document.getElementById('current-seed').textContent = `Seed: ${currentSeed}`
    seedInput.value = currentSeed
  }

  seedInput.addEventListener('change', () => {
    const enteredSeed = parseInt(seedInput.value)
    if (!isNaN(enteredSeed)) {
      currentSeed = enteredSeed
      updateSeedDisplay()
    }
  })


  updateSeedDisplay() // Display initial seed

  // Handle messages from WebSocket
  function handleSocketMessage(event) {
    const data = JSON.parse(event.data)

    if (data.type === 'status') {
      updateProgress(0, 0)
    } else if (data.type === 'execution_start') {
      updateProgress(100, 1)
    } else if (data.type === 'progress') {
      updateProgress(data['data']['max'], data['data']['value'])
    } else if (data.type === 'executed' && 'images' in data['data']['output']) {
      const images = data['data']['output']['images'][0]
      updateImage(images.filename, images.subfolder)
    }
  }

  // Update the image source
  function updateImage(filename, subfolder) {
    const rand = Math.random()
    const imageUrl = `/view?filename=${filename}&type=output&subfolder=${subfolder}&rand=${rand}`

    imageHistory.push(imageUrl)
    currentImageIndex = imageHistory.length - 1

    mainBuildElement.src = imageUrl
    updateImageNavigation()
  }

  // Load prompts from localStorage
  function loadPrompts() {
    const storedRecentPrompts = localStorage.getItem('recentPrompts')
    const storedFavoritePrompts = localStorage.getItem('favoritePrompts')

    if (storedRecentPrompts) {
      recentPrompts = JSON.parse(storedRecentPrompts)
    }

    if (storedFavoritePrompts) {
      favoritePrompts = JSON.parse(storedFavoritePrompts)
    }

    updatePromptLists()
  }

  // Save prompts to localStorage
  function savePrompts() {
    localStorage.setItem('recentPrompts', JSON.stringify(recentPrompts))
    localStorage.setItem('favoritePrompts', JSON.stringify(favoritePrompts))
  }

  // Update the prompt lists in the UI
  function updatePromptLists() {
    recentPromptsList.innerHTML = ''
    favoritePromptsList.innerHTML = ''

    recentPrompts.forEach((prompt, index) => {
      recentPromptsList.appendChild(createPromptItem(prompt, index, false))
    })

    favoritePrompts.forEach((prompt, index) => {
      favoritePromptsList.appendChild(createPromptItem(prompt, index, true))
    })
  }

  // Create a prompt item element
  function createPromptItem(prompt, index, isFavorite) {
    const li = document.createElement('li')
    li.className = 'prompt-item'

    const promptText = document.createElement('span')
    promptText.className = 'prompt-text'
    promptText.textContent = prompt
    promptText.addEventListener('click', () => {
      promptElement.value = prompt
    })

    const favoriteButton = document.createElement('button')
    favoriteButton.className = 'favorite-button'
    favoriteButton.innerHTML = isFavorite ? '&#9733;' : '&#9734;'
    favoriteButton.addEventListener('click', () => {
      if (isFavorite) {
        removeFromFavorites(index)
      } else {
        addToFavorites(prompt)
      }
    })



    const removeButton = document.createElement('button')
    removeButton.className = 'remove-button'
    removeButton.innerHTML = '&times;'
    removeButton.addEventListener('click', () => {
      if (isFavorite) {
        removeFromFavorites(index)
      } else {
        removeFromRecent(index)
      }
    })

    li.appendChild(promptText)
    li.appendChild(favoriteButton)
    li.appendChild(removeButton)

    return li
  }

  // Add a prompt to recent prompts
  function addToRecentPrompts(prompt) {
    recentPrompts = recentPrompts.filter(p => p !== prompt)
    recentPrompts.unshift(prompt)
    if (recentPrompts.length > maxRecentPrompts) {
      recentPrompts.pop()
    }
    savePrompts()
    updatePromptLists()
  }

  // Add a prompt to favorites
  function addToFavorites(prompt) {
    if (!favoritePrompts.includes(prompt)) {
      favoritePrompts.unshift(prompt)
      savePrompts()
      updatePromptLists()
    }
  }

  // Remove a prompt from recent prompts
  function removeFromRecent(index) {
    recentPrompts.splice(index, 1)
    savePrompts()
    updatePromptLists()
  }

  // Remove a prompt from favorites
  function removeFromFavorites(index) {
    favoritePrompts.splice(index, 1)
    savePrompts()
    updatePromptLists()
  }

  // Add this line with the other element selections at the beginning of your script
  const stepsInput = document.getElementById('steps')

  async function queuePromptWithText(text) {
    if (!text.trim()) {
      alert('Please enter some text to generate an image.')
      return
    }

    addToRecentPrompts(text)
    localStorage.setItem('lastPrompt', text)

    workflow['87']['inputs']['wildcard_text'] = text.replace(/(\r\n|\n|\r)/gm, ' ')

    // Update the seed based on the checkbox state and input
    if (!keepSeedCheckbox.checked) {
      currentSeed = Math.floor(Math.random() * 9999999999)
    } else {
      // If "Keep Seed" is checked, use the current seed or the value from the input
      currentSeed = parseInt(seedInput.value) || currentSeed
    }

    workflow['34']['inputs']['noise_seed'] = currentSeed
    workflow['60']['inputs']['seed'] = Math.floor(Math.random() * 9999999999)
    workflow['63']['inputs']['seed'] = Math.floor(Math.random() * 9999999999)
    updateSeedDisplay()

    // Update the width and height in the workflow
    const width = parseInt(imageWidthInput.value)
    const height = parseInt(imageHeightInput.value)
    workflow['25']['inputs']['width'] = width
    workflow['25']['inputs']['height'] = height

    // Update the number of steps
    const steps = parseInt(stepsInput.value)
    workflow['32']['inputs']['steps'] = steps

    const data = { prompt: workflow, client_id: clientId }
    try {
      const response = await fetch('/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to queue prompt')
      }

      const result = await response.json();

    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  }

  function showPreviousImage() {
    if (currentImageIndex > 0) {
      currentImageIndex--
      updateCurrentImage()
    }
  }

  function showNextImage() {
    if (currentImageIndex < imageHistory.length - 1) {
      currentImageIndex++
      updateCurrentImage()
    }
  }

  function updateCurrentImage() {
    mainBuildElement.src = imageHistory[currentImageIndex]
    updateImageNavigation()
  }

  function updateImageNavigation() {
    prevImageButton.disabled = currentImageIndex === 0
    nextImageButton.disabled = currentImageIndex === imageHistory.length - 1
    imageCounter.textContent = `${currentImageIndex + 1} / ${imageHistory.length}`

    // Ensure the image is in view
    mainBuildElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  // Function to update image dimensions
  function updateImageDimensions(width, height) {
    imageWidthInput.value = width
    imageHeightInput.value = height
    mainBuildElement.width = width
    mainBuildElement.height = height
  }

  // Add event listener for preset selector
  imageSizePreset.addEventListener('change', (e) => {
    if (e.target.value) {
      const [width, height] = e.target.value.split('x').map(Number)
      updateImageDimensions(width, height)
    }
  })

  keepSeedCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      // If checked, update the seed input with the current seed
      seedInput.value = currentSeed;
    } else {
      // If unchecked, clear the seed input
      seedInput.value = '';
    }
  })

  // Add event listeners for width and height inputs
  imageWidthInput.addEventListener('change', () => {
    mainBuildElement.width = imageWidthInput.value
    imageSizePreset.value = '' // Reset preset selector to "Custom Size"
  })
  imageHeightInput.addEventListener('change', () => {
    mainBuildElement.height = imageHeightInput.value
    imageSizePreset.value = '' // Reset preset selector to "Custom Size"
  })

  // Add event listener for prompt input to save changes
  promptElement.addEventListener('input', (e) => {
    localStorage.setItem('lastPrompt', e.target.value)
  })

  // Load prompts when the page loads
  loadPrompts()
  // Display initial seed at the end of initialization
  updateSeedDisplay()
})()