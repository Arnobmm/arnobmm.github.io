// Create floating particles
document.addEventListener('DOMContentLoaded', function() {
    const particlesContainer = document.getElementById('particles');
    const particleColors = ['#ff00ff', '#00ffff', '#9d00ff', '#00ff66'];
    
    for(let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 4 + 2;
        
        // Random color
        const color = particleColors[Math.floor(Math.random() * particleColors.length)];
        
        // Random animation duration
        const duration = Math.random() * 10 + 5;
        const delay = Math.random() * 5;
        
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.boxShadow = `0 0 10px ${color}`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        particlesContainer.appendChild(particle);
    }
    
    // Scroll animation
    const fadeElements = document.querySelectorAll('.fade-in');
    
    function checkFade() {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if(elementTop < windowHeight - 100) {
                element.classList.add('active');
            }
        });
    }
    
    // Initial check
    checkFade();
    
    // Check on scroll
    window.addEventListener('scroll', checkFade);
    
    // Menu button functionality
    const menuBtn = document.querySelector('.menu-btn');
    const sideMenu = document.querySelector('.side-menu');
    let menuOpen = false;
    
    menuBtn.addEventListener('click', () => {
        if(!menuOpen) {
            menuBtn.classList.add('open');
            sideMenu.classList.add('open');
            menuOpen = true;
        } else {
            menuBtn.classList.remove('open');
            sideMenu.classList.remove('open');
            menuOpen = false;
        }
    });

    // Close menu when clicking a link
    const menuLinks = document.querySelectorAll('.menu-links a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('open');
            sideMenu.classList.remove('open');
            menuOpen = false;
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        // Only act if menu is open
        if (menuOpen) {
            // Check if click was outside the menu and not on the menu button
            if (!sideMenu.contains(event.target) && !menuBtn.contains(event.target)) {
                menuBtn.classList.remove('open');
                sideMenu.classList.remove('open');
                menuOpen = false;
            }
        }
    });
}); 