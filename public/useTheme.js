const swapTheme = theme => {
  // add theme to data-theme on html element
  console.log('setting theme to: ', theme)
  document.documentElement.setAttribute('data-theme', theme)
  // set in local storage
  localStorage.theme = theme
}

document.addEventListener('DOMContentLoaded', () => {
  // set theme to dark or light
  const theme = localStorage.theme
  if (!theme) {
    // get system theme
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      swapTheme('dark')
    } else {
      swapTheme('light')
    }
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }

  // listen to system theme changes
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', e => {
      if (e.matches) {
        swapTheme('dark')
      } else {
        swapTheme('light')
      }
    })
})
