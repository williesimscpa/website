// Google Reviews integration for Willie Sims CPA website
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize reviews loading
    initializeReviews();
    
    function initializeReviews() {
        const reviewsContainer = document.getElementById('reviews-container');
        const staticReviews = document.getElementById('static-reviews');
        
        if (!reviewsContainer) return;
        
        // Show loading state
        showLoadingState(reviewsContainer);
        
        // Attempt to load reviews from API
        fetchReviews()
            .then(data => {
                if (data && data.result && data.result.reviews) {
                    displayReviews(data.result, reviewsContainer);
                } else {
                    showStaticReviews(reviewsContainer, staticReviews);
                }
            })
            .catch(error => {
                console.warn('Failed to load live reviews, showing static fallback:', error);
                showStaticReviews(reviewsContainer, staticReviews);
            })
            .finally(() => {
                hideLoadingState(reviewsContainer);
            });
    }
    
    async function fetchReviews() {
        try {
            const response = await fetch('/api/reviews', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status !== 'OK') {
                throw new Error(`API error: ${data.status}`);
            }
            
            return data;
            
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    }
    
    function displayReviews(reviewData, container) {
        const { reviews, rating, user_ratings_total } = reviewData;
        
        if (!reviews || reviews.length === 0) {
            showStaticReviews(container, document.getElementById('static-reviews'));
            return;
        }
        
        // Create reviews HTML
        const reviewsHTML = createReviewsHTML(reviews);
        
        // Create overall rating HTML
        const ratingHTML = createOverallRatingHTML(rating, user_ratings_total);
        
        // Update container
        container.innerHTML = `
            <div class="row g-4" id="dynamic-reviews">
                ${reviewsHTML}
            </div>
            <div class="text-center mt-4">
                ${ratingHTML}
                <a href="https://www.google.com/search?q=willie+sims+cpa+hattiesburg" target="_blank" class="btn btn-outline-primary">
                    <i class="fab fa-google me-2"></i>View All Google Reviews
                </a>
            </div>
        `;
        
        // Add fade-in animation to new reviews
        const reviewCards = container.querySelectorAll('.review-card');
        reviewCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }
    
    function createReviewsHTML(reviews) {
        return reviews.slice(0, 3).map(review => {
            const stars = createStarRating(review.rating);
            const timeAgo = formatTimeAgo(review.time);
            const reviewText = sanitizeHTML(review.text);
            const authorName = sanitizeHTML(review.author_name);
            
            return `
                <div class="col-md-4">
                    <div class="review-card p-4 h-100">
                        <div class="review-rating mb-3">
                            ${stars}
                        </div>
                        <p class="review-text mb-3">"${reviewText}"</p>
                        <div class="review-author">
                            <strong>${authorName}</strong>
                            <small class="text-muted d-block">${timeAgo}</small>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function createOverallRatingHTML(rating, totalReviews) {
        const roundedRating = Math.round(rating * 10) / 10;
        const stars = createStarRating(Math.round(rating));
        
        return `
            <div class="overall-rating mb-3">
                <div class="rating-stars mb-2">
                    ${stars}
                </div>
                <p class="mb-3">
                    <strong>Overall Rating: ${roundedRating}/5</strong> 
                    <span class="text-muted">based on ${totalReviews} reviews</span>
                </p>
            </div>
        `;
    }
    
    function createStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star text-warning"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star text-warning"></i>';
        }
        
        return stars;
    }
    
    function formatTimeAgo(timeString) {
        // Handle different time formats from Google API
        if (!timeString) return 'Recently';
        
        // If it's already formatted (e.g., "2 months ago"), return as is
        if (timeString.includes('ago')) {
            return timeString;
        }
        
        // If it's a timestamp, convert it
        try {
            const date = new Date(timeString);
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            
            if (diffInSeconds < 60) return 'Just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
            if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
            if (diffInSeconds < 2419200) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
            return `${Math.floor(diffInSeconds / 2419200)} months ago`;
        } catch (error) {
            return timeString;
        }
    }
    
    function sanitizeHTML(str) {
        if (!str) return '';
        
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML.substring(0, 200) + (str.length > 200 ? '...' : '');
    }
    
    function showStaticReviews(container, staticReviews) {
        if (staticReviews) {
            // Ensure static reviews are visible
            staticReviews.style.display = 'flex';
            
            // Add animation to static reviews
            const reviewCards = staticReviews.querySelectorAll('.review-card');
            reviewCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.6s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 150);
            });
        }
    }
    
    function showLoadingState(container) {
        const loadingHTML = `
            <div class="reviews-loading text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Loading reviews...</span>
                </div>
                <p class="text-muted">Loading our latest reviews...</p>
            </div>
        `;
        
        // Hide static reviews during loading
        const staticReviews = document.getElementById('static-reviews');
        if (staticReviews) {
            staticReviews.style.display = 'none';
        }
        
        // Show loading state
        const loadingDiv = document.createElement('div');
        loadingDiv.innerHTML = loadingHTML;
        loadingDiv.id = 'reviews-loading';
        container.appendChild(loadingDiv);
    }
    
    function hideLoadingState(container) {
        const loadingElement = container.querySelector('#reviews-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    
    // Refresh reviews function (can be called externally)
    window.refreshReviews = function() {
        const reviewsContainer = document.getElementById('reviews-container');
        if (reviewsContainer) {
            initializeReviews();
        }
    };
    
    // Auto-refresh reviews every 30 minutes (optional)
    if (window.location.pathname === '/' || window.location.pathname === '/index') {
        setInterval(() => {
            console.log('Auto-refreshing reviews...');
            if (typeof window.refreshReviews === 'function') {
                window.refreshReviews();
            }
        }, 30 * 60 * 1000); // 30 minutes
    }
    
    // Handle review card interactions
    document.addEventListener('click', function(e) {
        const reviewCard = e.target.closest('.review-card');
        if (reviewCard) {
            // Add subtle click effect
            reviewCard.style.transform = 'scale(0.98)';
            setTimeout(() => {
                reviewCard.style.transform = '';
            }, 150);
        }
    });
    
    // Error handling for network issues
    window.addEventListener('online', function() {
        console.log('Connection restored, refreshing reviews...');
        if (typeof window.refreshReviews === 'function') {
            window.refreshReviews();
        }
    });
    
    // Performance monitoring
    const reviewsLoadStart = performance.now();
    
    window.addEventListener('load', function() {
        const reviewsLoadEnd = performance.now();
        const loadTime = reviewsLoadEnd - reviewsLoadStart;
        
        if (loadTime > 3000) {
            console.warn(`Reviews took ${Math.round(loadTime)}ms to load. Consider optimization.`);
        } else {
            console.log(`Reviews loaded successfully in ${Math.round(loadTime)}ms`);
        }
    });
    
});

// Utility function for handling review interactions
function handleReviewClick(reviewElement) {
    // Could be used for analytics or modal display
    const authorName = reviewElement.querySelector('.review-author strong')?.textContent;
    const rating = reviewElement.querySelectorAll('.fa-star.text-warning').length;
    
    console.log(`Review interaction: ${authorName}, ${rating} stars`);
    
    // Track review engagement (if analytics is implemented)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'review_interaction', {
            'event_category': 'Reviews',
            'event_label': authorName,
            'value': rating
        });
    }
}

