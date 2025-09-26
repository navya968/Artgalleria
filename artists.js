document.addEventListener('DOMContentLoaded', function() {
    // Search Functionality
    const searchInput = document.querySelector('.search-box input');
    const artistCards = document.querySelectorAll('.artist-card');
    const featuredCards = document.querySelectorAll('.featured-artist-card');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            // Search in all artists
            artistCards.forEach(function(card) {
                const artistName = card.querySelector('h3').textContent.toLowerCase();
                const artistStyle = card.querySelector('.artist-style').textContent.toLowerCase();
                const artistLocation = card.querySelector('.artist-location').textContent.toLowerCase();
                
                if (artistName.includes(searchTerm) || 
                    artistStyle.includes(searchTerm) || 
                    artistLocation.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Search in featured artists
            featuredCards.forEach(function(card) {
                const artistName = card.querySelector('h3').textContent.toLowerCase();
                const artistTitle = card.querySelector('.artist-title').textContent.toLowerCase();
                const artistLocation = card.querySelector('.artist-location').textContent.toLowerCase();
                
                if (artistName.includes(searchTerm) || 
                    artistTitle.includes(searchTerm) || 
                    artistLocation.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Update section visibility based on search results
            updateSectionVisibility();
        });
    }
    
    // Function to update section visibility
    function updateSectionVisibility() {
        const featuredSection = document.querySelector('.featured-artists');
        const allArtistsSection = document.querySelector('.all-artists');
        
        // Check if any featured artists are visible
        let featuredVisible = false;
        featuredCards.forEach(function(card) {
            if (card.style.display !== 'none') {
                featuredVisible = true;
            }
        });
        
        // Check if any regular artists are visible
        let artistsVisible = false;
        artistCards.forEach(function(card) {
            if (card.style.display !== 'none') {
                artistsVisible = true;
            }
        });
        
        // Show/hide sections based on visibility
        if (featuredSection) {
            featuredSection.style.display = featuredVisible ? 'block' : 'none';
        }
        
        if (allArtistsSection) {
            allArtistsSection.style.display = artistsVisible ? 'block' : 'none';
        }
    }
    
    // Filter Functionality
    const filterOptions = document.querySelectorAll('.filter-options input');
    const resetFilterBtn = document.querySelector('.filter-actions .btn-outline');
    const applyFilterBtn = document.querySelector('.filter-actions .btn-primary');
    
    // Apply filters
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', function() {
            // Get selected filters
            const selectedStyles = [];
            const selectedMediums = [];
            const selectedLocations = [];
            
            filterOptions.forEach(function(option) {
                if (option.checked) {
                    const filterGroup = option.closest('.filter-group');
                    const filterType = filterGroup.querySelector('h3').textContent;
                    const filterValue = option.nextElementSibling.textContent.trim().toLowerCase();
                    
                    if (filterType === 'Art Style') {
                        selectedStyles.push(filterValue);
                    } else if (filterType === 'Medium') {
                        selectedMediums.push(filterValue);
                    } else if (filterType === 'Location') {
                        selectedLocations.push(filterValue);
                    }
                }
            });
            
            // Apply filters to all artists
            artistCards.forEach(function(card) {
                const artistStyle = card.querySelector('.artist-style').textContent.toLowerCase();
                const artistLocation = card.querySelector('.artist-location').textContent.toLowerCase();
                
                let styleMatch = selectedStyles.length === 0 || selectedStyles.some(style => artistStyle.includes(style));
                let mediumMatch = selectedMediums.length === 0 || selectedMediums.some(medium => artistStyle.includes(medium));
                let locationMatch = selectedLocations.length === 0 || selectedLocations.some(location => artistLocation.includes(location));
                
                if (styleMatch && mediumMatch && locationMatch) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Apply filters to featured artists
            featuredCards.forEach(function(card) {
                const artistTitle = card.querySelector('.artist-title').textContent.toLowerCase();
                const artistLocation = card.querySelector('.artist-location').textContent.toLowerCase();
                
                let styleMatch = selectedStyles.length === 0 || selectedStyles.some(style => artistTitle.includes(style));
                let mediumMatch = selectedMediums.length === 0 || selectedMediums.some(medium => artistTitle.includes(medium));
                let locationMatch = selectedLocations.length === 0 || selectedLocations.some(location => artistLocation.includes(location));
                
                if (styleMatch && mediumMatch && locationMatch) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Update section visibility
            updateSectionVisibility();
            
            // Close dropdown
            document.querySelector('.filter-dropdown .dropdown-content').style.display = 'none';
            setTimeout(function() {
                document.querySelector('.filter-dropdown .dropdown-content').style.display = '';
            }, 100);
        });
    }
    
    // Reset filters
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', function() {
            // Uncheck all filter options
            filterOptions.forEach(function(option) {
                option.checked = false;
            });
            
            // Show all artists
            artistCards.forEach(function(card) {
                card.style.display = 'block';
            });
            
            featuredCards.forEach(function(card) {
                card.style.display = 'block';
            });
            
            // Update section visibility
            updateSectionVisibility();
        });
    }
    
    // Sort Functionality
    const sortOptions = document.querySelectorAll('.sort-option');
    
    sortOptions.forEach(function(option) {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all options
            sortOptions.forEach(function(opt) {
                opt.classList.remove('active');
            });
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Get sort value
            const sortValue = this.textContent.trim();
            
            // Sort artists based on selected option
            sortArtists(sortValue);
            
            // Close dropdown
            document.querySelector('.sort-dropdown .dropdown-content').style.display = 'none';
            setTimeout(function() {
                document.querySelector('.sort-dropdown .dropdown-content').style.display = '';
            }, 100);
        });
    });
    
    // Function to sort artists
    function sortArtists(sortValue) {
        // Get all artists from the grid
        const artistsGrid = document.querySelector('.artists-grid');
        const artists = Array.from(artistsGrid.children);
        
        // Sort artists based on sort value
        artists.sort(function(a, b) {
            const nameA = a.querySelector('h3').textContent;
            const nameB = b.querySelector('h3').textContent;
            
            if (sortValue === 'Name (A-Z)') {
                return nameA.localeCompare(nameB);
            } else if (sortValue === 'Name (Z-A)') {
                return nameB.localeCompare(nameA);
            } else if (sortValue === 'Most Popular') {
                // For demo purposes, we'll use a random popularity metric
                // In a real app, this would be based on actual data
                const followersA = Math.random() * 1000;
                const followersB = Math.random() * 1000;
                return followersB - followersA;
            } else if (sortValue === 'Newest') {
                // For demo purposes, we'll use a random date
                // In a real app, this would be based on actual join dates
                const dateA = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));
                const dateB = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));
                return dateB - dateA;
            }
            
            // Default (Featured) - return to original order
            return 0;
        });
        
        // Remove all artists from the grid
        artists.forEach(function(artist) {
            artistsGrid.removeChild(artist);
        });
        
        // Add sorted artists back to the grid
        artists.forEach(function(artist) {
            artistsGrid.appendChild(artist);
        });
    }
    
    // Pagination Functionality
    const pageLinks = document.querySelectorAll('.pagination .page-link');
    
    pageLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            pageLinks.forEach(function(link) {
                link.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // In a real app, this would load the next page of artists
            // For demo purposes, we'll just scroll to the top of the artists section
            document.querySelector('.all-artists').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Dropdown Hover Functionality
    const dropdowns = document.querySelectorAll('.filter-dropdown, .sort-dropdown');
    
    dropdowns.forEach(function(dropdown) {
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        const dropdownBtn = dropdown.querySelector('button');
        
        // Show dropdown on button click instead of hover
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Close all other dropdowns
            dropdowns.forEach(function(d) {
                if (d !== dropdown) {
                    d.querySelector('.dropdown-content').style.display = 'none';
                }
            });
            
            // Toggle current dropdown
            if (dropdownContent.style.display === 'block') {
                dropdownContent.style.display = 'none';
            } else {
                dropdownContent.style.display = 'block';
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            dropdownContent.style.display = 'none';
        });
        
        // Prevent dropdown from closing when clicking inside
        dropdownContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // Artist Card Hover Animation
    artistCards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            const overlay = this.querySelector('.artist-overlay');
            overlay.style.opacity = '1';
        });
        
        card.addEventListener('mouseleave', function() {
            const overlay = this.querySelector('.artist-overlay');
            overlay.style.opacity = '0';
        });
    });
    
    // Featured Artist Card Animation
    featuredCards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            const banner = this.querySelector('.artist-banner img');
            banner.style.transform = 'scale(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
            const banner = this.querySelector('.artist-banner img');
            banner.style.transform = 'scale(1)';
        });
    });
});
