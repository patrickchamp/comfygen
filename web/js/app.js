// ComfyGen Studio: Mobile-friendly frontend for ComfyUI

// Optimized for the Flux image generation model

//

// This script manages:

// 1. User interface for image generation settings

// 2. Communication with ComfyUI backend via WebSocket

// 3. Prompt history and image navigation

// 4. Integration with Flux workflow nodes



(async () => {

  // Initialize server connection and load workflow

  const serverAddress = `${window.location.hostname}:${window.location.port}`

  const clientId = uuidv4()

  const socketUrl = `ws://${serverAddress}/ws?clientId=${clientId}`

  const workflow = await loadWorkflow()



  // DOM element references

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

  const keepSeedCheckbox = document.getElementById('keep-seed')

  const seedInput = document.getElementById('seed-input')

  const stepsInput = document.getElementById('steps')



  // State variables

  let recentPrompts = []

  let favoritePrompts = []

  const maxRecentPrompts = 25

  let imageHistory = []

  let currentImageIndex = -1

  let currentSeed = Math.floor(Math.random() * 9999999999)



  // Initialize application

  initializeApp()



  // Main functions

  async function queuePromptWithText(text) {

    if (!text.trim()) {

      alert('Please enter some text to generate an image.')

      return

    }



    addToRecentPrompts(text)

    localStorage.setItem('lastPrompt', text)



    // Update Flux workflow nodes

    workflow['87']['inputs']['wildcard_text'] = text.replace(/(\r\n|\n|\r)/gm, ' ') // ImpactWildcardEncode node



    updateSeed()

    updateWorkflowDimensions()

    updateWorkflowSteps()



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



      await response.json()

    } catch (error) {

      console.error('Error:', error)

      alert('An error occurred. Please try again.')

    }

  }



  // WebSocket handling

  function handleSocketMessage(event) {

    const data = JSON.parse(event.data)



    switch (data.type) {

      case 'status':

        updateProgress(0, 0)

        break

      case 'execution_start':

        updateProgress(100, 1)

        break

      case 'progress':

        updateProgress(data['data']['max'], data['data']['value'])

        break

      case 'executed':

        if ('images' in data['data']['output']) {

          const images = data['data']['output']['images'][0]

          updateImage(images.filename, images.subfolder)

        }

        break

    }

  }



  // Image management functions

  function updateImage(filename, subfolder) {

    const rand = Math.random()

    const imageUrl = `/view?filename=${filename}&type=output&subfolder=${subfolder}&rand=${rand}`



    imageHistory.push(imageUrl)

    currentImageIndex = imageHistory.length - 1



    mainBuildElement.src = imageUrl

    updateImageNavigation()

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

    mainBuildElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

  }



  // Prompt management functions

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



  function savePrompts() {

    localStorage.setItem('recentPrompts', JSON.stringify(recentPrompts))

    localStorage.setItem('favoritePrompts', JSON.stringify(favoritePrompts))

  }



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



  function addToRecentPrompts(prompt) {

    recentPrompts = recentPrompts.filter(p => p !== prompt)

    recentPrompts.unshift(prompt)

    if (recentPrompts.length > maxRecentPrompts) {

      recentPrompts.pop()

    }

    savePrompts()

    updatePromptLists()

  }



  function addToFavorites(prompt) {

    if (!favoritePrompts.includes(prompt)) {

      favoritePrompts.unshift(prompt)

      savePrompts()

      updatePromptLists()

    }

  }



  function removeFromRecent(index) {

    recentPrompts.splice(index, 1)

    savePrompts()

    updatePromptLists()

  }



  function removeFromFavorites(index) {

    favoritePrompts.splice(index, 1)

    savePrompts()

    updatePromptLists()

  }



  // Seed management functions

  function updateSeedDisplay() {

    document.getElementById('current-seed').textContent = `Seed: ${currentSeed}`

    seedInput.value = currentSeed

  }



  function handleSeedInputChange() {

    const enteredSeed = parseInt(seedInput.value)

    if (!isNaN(enteredSeed)) {

      currentSeed = enteredSeed

      updateSeedDisplay()

    }

  }



  function updateSeed() {

    if (!keepSeedCheckbox.checked) {

        currentSeed = Math.floor(Math.random() * 9999999999);

    } else {

        currentSeed = parseInt(seedInput.value) || currentSeed;

    }

    workflow['34']['inputs']['noise_seed'] = currentSeed; // RandomNoise node

    

    // Set a random seed for the wildcard to introduce variation

    workflow['87']['inputs']['seed'] = Math.floor(Math.random() * 9999999999); 



    updateSeedDisplay();

}



  // Utility functions

  function uuidv4() {

    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>

      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))

  }



  async function loadWorkflow() {

    const response = await fetch('/comfygen/js/base_workflow.json')

    return response.json()

  }



  function updateProgress(max = 0, value = 0) {

    progressBar.max = max

    progressBar.value = value

  }



  function updateImageDimensions(width, height) {

    imageWidthInput.value = width

    imageHeightInput.value = height

    mainBuildElement.width = width

    mainBuildElement.height = height

  }



  function updateWorkflowDimensions() {

    const width = parseInt(imageWidthInput.value)

    const height = parseInt(imageHeightInput.value)

    workflow['25']['inputs']['width'] = width // EmptyLatentImage node

    workflow['25']['inputs']['height'] = height // EmptyLatentImage node

  }



  function updateWorkflowSteps() {

    const steps = parseInt(stepsInput.value)

    workflow['32']['inputs']['steps'] = steps // BasicScheduler node

  }



  function clearPrompt() {

    promptElement.value = ''

    localStorage.removeItem('lastPrompt')

  }



  // Initialization function

  function initializeApp() {

  // Load last prompt from localStorage

  const lastPrompt = localStorage.getItem('lastPrompt')

  if (lastPrompt) promptElement.value = lastPrompt



  // Set up WebSocket

  socket = new WebSocket(socketUrl);



  socket.addEventListener('open', () => {

    console.log('Connected to the server');

  });



  socket.addEventListener('message', handleSocketMessage);



  socket.addEventListener('close', () => {

    console.log('WebSocket connection closed. Attempting to reconnect...');

    setTimeout(initializeApp, 1000);

  });



  socket.addEventListener('error', (error) => {

    console.error('WebSocket error:', error);

  });



  // Add event listener for when the page becomes visible again

  document.addEventListener('visibilitychange', () => {

    if (!document.hidden && socket.readyState !== WebSocket.OPEN) {

      console.log('Page visible, reconnecting WebSocket');

      socket = new WebSocket(socketUrl);

    }

  });



  // Add event listeners

  sendPromptButton.addEventListener('click', () => queuePromptWithText(promptElement.value))

  clearPromptButton.addEventListener('click', clearPrompt)

  prevImageButton.addEventListener('click', showPreviousImage)

  nextImageButton.addEventListener('click', showNextImage)

  imageSizePreset.addEventListener('change', (e) => {

    if (e.target.value) {

      const [width, height] = e.target.value.split('x').map(Number)

      updateImageDimensions(width, height)

    }

  })

  keepSeedCheckbox.addEventListener('change', (e) => {

    seedInput.value = e.target.checked ? currentSeed : ''

  })

  imageWidthInput.addEventListener('change', () => {

    mainBuildElement.width = imageWidthInput.value

    imageSizePreset.value = '' // Reset preset selector to "Custom Size"

  })

  imageHeightInput.addEventListener('change', () => {

    mainBuildElement.height = imageHeightInput.value

    imageSizePreset.value = '' // Reset preset selector to "Custom Size"

  })

  promptElement.addEventListener('input', (e) => {

    localStorage.setItem('lastPrompt', e.target.value)

  })

  seedInput.addEventListener('change', handleSeedInputChange)



  // Initialize prompts and seed display

  loadPrompts()

  updateSeedDisplay()

}

})()