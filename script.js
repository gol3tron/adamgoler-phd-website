// ===================================
// Mobile Navigation Toggle
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger icon
            this.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navToggle.contains(event.target) || navMenu.contains(event.target);
            
            if (!isClickInsideNav && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });

        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // ===================================
    // Smooth Scrolling
    // ===================================

    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only apply smooth scroll to anchor links (not just "#")
            if (href !== '#' && href.length > 1) {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // ===================================
    // Contact Form Validation
    // ===================================

    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        // Real-time validation
        const formInputs = contactForm.querySelectorAll('input, textarea');
        
        formInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                // Clear error on input
                if (this.classList.contains('error')) {
                    this.classList.remove('error');
                    const errorElement = document.getElementById(this.id + 'Error');
                    if (errorElement) {
                        errorElement.textContent = '';
                    }
                }
            });
        });

        // Form submission
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const formStatus = document.getElementById('formStatus');
            
            // Validate all fields
            formInputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });

            if (isValid) {
                // Simulate form submission
                formStatus.className = 'form-status success';
                formStatus.textContent = 'Thank you for your message! I will get back to you soon.';
                
                // Reset form
                setTimeout(() => {
                    contactForm.reset();
                    formStatus.style.display = 'none';
                }, 5000);
            } else {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Please correct the errors above and try again.';
                
                // Hide error message after 5 seconds
                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 5000);
            }
        });
    }

    // ===================================
    // Field Validation Function
    // ===================================

    function validateField(field) {
        const value = field.value.trim();
        const errorElement = document.getElementById(field.id + 'Error');
        let errorMessage = '';

        // Check if field is required and empty
        if (field.hasAttribute('required') && value === '') {
            errorMessage = 'This field is required.';
        }
        // Validate email format
        else if (field.type === 'email' && value !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = 'Please enter a valid email address.';
            }
        }
        // Validate name (should not contain numbers)
        else if (field.id === 'name' && value !== '') {
            const nameRegex = /^[a-zA-Z\s'-]+$/;
            if (!nameRegex.test(value)) {
                errorMessage = 'Please enter a valid name.';
            }
        }
        // Validate message length
        else if (field.id === 'message' && value !== '') {
            if (value.length < 10) {
                errorMessage = 'Message must be at least 10 characters long.';
            }
        }

        // Display error or clear it
        if (errorMessage) {
            field.classList.add('error');
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
            return false;
        } else {
            field.classList.remove('error');
            if (errorElement) {
                errorElement.textContent = '';
            }
            return true;
        }
    }

    // ===================================
    // Add Animation on Scroll (Optional)
    // ===================================

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe cards, blog posts, and portfolio items
    const animatedElements = document.querySelectorAll('.card, .blog-post, .portfolio-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // ===================================
    // Active Navigation Highlighting
    // ===================================

    // Get the current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Remove active class from all links
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        // Add active class to current page link
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});
