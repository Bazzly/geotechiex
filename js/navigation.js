// Shared Navigation Component for GeoTechieX
// This script handles mobile menu toggle and provides consistent navigation across all pages

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuDropdown = document.getElementById('mobile-menu-dropdown');
    
    if (mobileMenuButton && mobileMenuDropdown) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenuDropdown.classList.toggle('hidden');
            
            // Animate hamburger icon
            const icon = mobileMenuButton.querySelector('svg');
            if (icon) {
                icon.classList.toggle('rotate-90');
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = mobileMenuButton.contains(event.target) || 
                                 mobileMenuDropdown.contains(event.target);
            
            if (!isClickInside && !mobileMenuDropdown.classList.contains('hidden')) {
                mobileMenuDropdown.classList.add('hidden');
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Close mobile menu if open
                    if (mobileMenuDropdown && !mobileMenuDropdown.classList.contains('hidden')) {
                        mobileMenuDropdown.classList.add('hidden');
                    }
                }
            }
        });
    });
    
    // Add active class to current page link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === currentPage || 
            link.getAttribute('href') === '/' + currentPage) {
            link.classList.add('bg-white/20', 'font-semibold');
        }
    });
});
