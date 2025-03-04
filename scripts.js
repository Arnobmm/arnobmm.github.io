// Simple Typing Animation with Rainbow Effect
const phrases = [
    { text: "Welcome to My", colorText: "Website!" },
    { text: "Explore amazing", colorText: "content!" },
    { text: "Stay tuned for", colorText: "more!" }
];

// New playful phrases with emojis
const playfulPhrases = [
    "Let's get started! 🚀",
    "Ready to explore some cool ideas? 💡"
];

// Animation state
let currentPhraseIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let typingSpeed = 70; // Faster typing 
let deleteSpeed = 30; // Faster deleting
let pauseEnd = 1500; // Shorter pause after typing
let pauseStart = 300; // Shorter pause before new phrase

// Animation state for playful typing
let playfulPhraseIndex = 0;
let playfulCharIndex = 0;
let playfulIsDeleting = false;
let playfulTypingSpeed = 60; // Even faster for the playful text
let playfulDeleteSpeed = 25; // Faster deletion
let playfulPauseEnd = 2000; // Longer pause to read the fun messages
let playfulPauseStart = 500; // Pause before new phrase

function typeEffect() {
    const typingElement = document.getElementById("typing-text");
    const currentPhrase = phrases[currentPhraseIndex];
    const fullText = currentPhrase.text + " " + currentPhrase.colorText;
    
    if (!isDeleting && currentCharIndex <= fullText.length) {
        // Typing
        // Check if we're at the point where the rainbow part starts
        if (currentCharIndex <= currentPhrase.text.length) {
            // Still typing the normal part
            typingElement.innerHTML = fullText.substring(0, currentCharIndex);
        } else {
            // Starting to type the rainbow part
            const regularPart = currentPhrase.text;
            const colorfulPart = fullText.substring(currentPhrase.text.length + 1, currentCharIndex);
            typingElement.innerHTML = regularPart + " <span class='rainbow-text'>" + colorfulPart + "</span>";
        }
        
        currentCharIndex++;
        setTimeout(typeEffect, typingSpeed);
    } 
    else if (!isDeleting && currentCharIndex > fullText.length) {
        // Pause after typing complete
        setTimeout(() => {
            isDeleting = true;
            typeEffect();
        }, pauseEnd);
    } 
    else if (isDeleting && currentCharIndex > 0) {
        // Deleting - always use plain text when deleting to avoid flickering
        typingElement.textContent = fullText.substring(0, currentCharIndex - 1);
        currentCharIndex--;
        setTimeout(typeEffect, deleteSpeed);
    } 
    else if (isDeleting && currentCharIndex === 0) {
        // Move to next phrase
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        
        setTimeout(typeEffect, pauseStart);
    }
}

// Playful typing effect function
function playfulTypeEffect() {
    const typingElement = document.getElementById("playful-typing-text");
    const currentPhrase = playfulPhrases[playfulPhraseIndex];
    
    if (!playfulIsDeleting && playfulCharIndex <= currentPhrase.length) {
        // Typing
        typingElement.textContent = currentPhrase.substring(0, playfulCharIndex);
        playfulCharIndex++;
        
        // Random speed variation for natural typing feel
        const randomSpeed = Math.random() * 40;
        const finalSpeed = Math.max(playfulTypingSpeed - randomSpeed, 20);
        
        setTimeout(playfulTypeEffect, finalSpeed);
    } 
    else if (!playfulIsDeleting && playfulCharIndex > currentPhrase.length) {
        // Pause after typing complete
        setTimeout(() => {
            playfulIsDeleting = true;
            playfulTypeEffect();
        }, playfulPauseEnd);
    } 
    else if (playfulIsDeleting && playfulCharIndex > 0) {
        // Deleting
        typingElement.textContent = currentPhrase.substring(0, playfulCharIndex - 1);
        playfulCharIndex--;
        setTimeout(playfulTypeEffect, playfulDeleteSpeed);
    } 
    else if (playfulIsDeleting && playfulCharIndex === 0) {
        // Move to next phrase
        playfulIsDeleting = false;
        playfulPhraseIndex = (playfulPhraseIndex + 1) % playfulPhrases.length;
        
        setTimeout(playfulTypeEffect, playfulPauseStart);
    }
}

// Add hover effects to portfolio items
function setupHoverEffects() {
    // Add hover effects to portfolio items
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const img = item.querySelector('img');
            const heading = item.querySelector('h3');
            
            // Create a shimmer effect on the image
            if (img) {
                img.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                img.classList.add('highlight-on-hover');
            }
            
            // Make the heading more prominent
            if (heading) {
                heading.style.transition = 'all 0.4s ease';
                heading.style.textShadow = '0 0 15px rgba(255, 204, 0, 0.7)';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            const img = item.querySelector('img');
            const heading = item.querySelector('h3');
            
            if (img) {
                img.classList.remove('highlight-on-hover');
            }
            
            if (heading) {
                heading.style.textShadow = '0 0 10px rgba(255, 204, 0, 0.5)';
            }
        });
    });
    
    // Add interactive hover to section headings
    const sectionHeadings = document.querySelectorAll('section h2');
    sectionHeadings.forEach(heading => {
        heading.addEventListener('mouseenter', () => {
            heading.style.transform = 'scale(1.05)';
        });
        
        heading.addEventListener('mouseleave', () => {
            heading.style.transform = 'scale(1)';
        });
    });
}

// Start the typing animation when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    const typingContainer = document.querySelector('.typing-container');
    typingContainer.classList.add('fade-in');
    
    const playfulTypingContainer = document.querySelector('.playful-typing-container');
    playfulTypingContainer.classList.add('fade-in');
    
    // Start typing with a small delay
    setTimeout(typeEffect, 800);
    
    // Start playful typing after a longer delay
    setTimeout(playfulTypeEffect, 2000);
    
    // Add subtle parallax effect to hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            hero.style.backgroundPosition = `${50 + x * 10}% ${50 + y * 10}%`;
        });
    }
    
    // Setup hover effects
    setupHoverEffects();
    
    // Enhanced form interaction
    setupFormInteractions();
});

// Enhanced form interactions
function setupFormInteractions() {
    const contactForm = document.getElementById('contact-form');
    const responseElement = document.getElementById('response');
    const formInputs = contactForm.querySelectorAll('input, textarea');
    
    // Add focus/blur effects to form elements
    formInputs.forEach(input => {
        // Create label element if it doesn't exist
        const inputId = input.getAttribute('placeholder').toLowerCase().replace(/\s+/g, '-');
        input.id = inputId;
        
        input.addEventListener('focus', () => {
            input.classList.add('active');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.classList.remove('active');
            }
        });
    });
    
    // Enhanced form submission
    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();
        
        // Animate the button
        const button = contactForm.querySelector('button');
        button.innerHTML = "Sending...";
        button.style.backgroundColor = "rgba(255, 255, 0, 0.3)";
        
        // Simulate sending (you would replace this with actual form submission)
        setTimeout(() => {
            button.innerHTML = "Message Sent!";
            button.style.backgroundColor = "rgba(0, 255, 0, 0.3)";
            
            // Show response with animation
            responseElement.innerText = "Thanks for your message! We'll get back to you soon.";
            responseElement.classList.add('show');
            
            // Reset form after delay
            setTimeout(() => {
                formInputs.forEach(input => input.value = '');
                button.innerHTML = "Send";
                button.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                
                // Keep the thank you message visible
            }, 3000);
        }, 1500);
    });
}
