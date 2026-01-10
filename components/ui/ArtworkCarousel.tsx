'use client';

import React, { useState, useEffect, useCallback } from 'react';

import NextImage from 'next/image';

interface Artwork {
	id: number;
	title: string;
	image_id: string;
	api_link?: string;
	thumbnail?: {
		lqip: string;
		width: number;
		height: number;
		alt_text: string;
	};
	artist_display?: string;
}

interface ArtworkCarouselProps {
	autoPlayInterval?: number;
	apiUrl?: string;
}

const ArtworkCarousel: React.FC<ArtworkCarouselProps> = ({
	autoPlayInterval = 1000, // 5 minutes (5 * 60 * 1000)
	apiUrl = 'https://api.artic.edu/api/v1/artworks',
}) => {
	const [artworks, setArtworks] = useState<Artwork[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [isHovering, setIsHovering] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMoreArtworks, setHasMoreArtworks] = useState(true);
	const [isImageLoaded, setIsImageLoaded] = useState(false);

	// Reset image loaded state when index changes
	useEffect(() => {
		setIsImageLoaded(false);
	}, [currentIndex]);

	// Check if the current image is already cached
	useEffect(() => {
		const currentImage = artworks[currentIndex];
		if (currentImage && currentImage.image_id) {
			const img = new Image();
			img.src = `/api/image?url=${encodeURIComponent(getImageUrl(currentImage.image_id))}`;
			if (img.complete) {
				setIsImageLoaded(true);
			}
		}
	}, [currentIndex, artworks]);

	// Fetch artworks from API - show all types of art
	const fetchArtworks = useCallback(async (pageToFetch: number = 1, append: boolean = false) => {
		try {
			if (!append) {
				setIsLoading(true);
			}
			setError(null);

			let newArtworks: Artwork[] = [];

			// For initial load, fetch "The Red Armchair" by Picasso first
			if (!append && pageToFetch === 1) {
				try {
					// Fetch the specific artwork: The Red Armchair (ID: 5357)
					const redArmchairResponse = await fetch(`${apiUrl}/5357`);
					if (redArmchairResponse.ok) {
						const redArmchairData = await redArmchairResponse.json();
						const artworkData = redArmchairData.data;

						if (artworkData && artworkData.image_id) {
							newArtworks.push({
								id: artworkData.id,
								title: artworkData.title,
								image_id: artworkData.image_id,
								api_link: artworkData.api_link,
								thumbnail: artworkData.thumbnail,
								artist_display: artworkData.artist_display,
							});
						}
					}
				} catch (err) {
					console.error('Error fetching The Red Armchair:', err);
				}
			}

			// Fetch regular artworks
			const response = await fetch(`${apiUrl}?page=${pageToFetch}&limit=100`);

			if (!response.ok) {
				throw new Error('Failed to fetch artworks');
			}

			const data = await response.json();
			const regularArtworks = (data.data as Artwork[])
				.filter((artwork) => {
					// Only require that the artwork has an image
					// Skip if it's already in newArtworks (the Picasso one)
					const alreadyAdded = newArtworks.some(a => a.id === artwork.id);
					return artwork.image_id && !alreadyAdded;
				})
				.map((artwork) => ({
					id: artwork.id,
					title: artwork.title,
					image_id: artwork.image_id,
					api_link: artwork.api_link,
					thumbnail: artwork.thumbnail,
					artist_display: artwork.artist_display,
				}));

			newArtworks = [...newArtworks, ...regularArtworks];

			if (append) {
				// Append new artworks, avoiding duplicates
				setArtworks(prev => {
					const existingIds = new Set(prev.map(a => a.id));
					const uniqueNewArtworks = newArtworks.filter(a => !existingIds.has(a.id));
					return [...prev, ...uniqueNewArtworks];
				});
			} else {
				// Initial load - Picasso first, then other artworks
				setArtworks(newArtworks.slice(0, 12));
				setCurrentPage(pageToFetch);
			}

			// Check if there are more pages
			setHasMoreArtworks(!!data.pagination?.next_url);
			setCurrentPage(pageToFetch);
		} catch (err) {
			setImageErrors(prev => new Set(prev));
			console.error('Error fetching artworks:', err);
			setError('Failed to load artwork images');
		} finally {
			setIsLoading(false);
		}
	}, [apiUrl]);

	// Initial load
	useEffect(() => {
		fetchArtworks(1, false);
	}, [fetchArtworks]);

	// Load more artworks when approaching the end
	useEffect(() => {
		if (artworks.length === 0) return;

		// Load more when we're 3 artworks away from the end
		const remainingArtworks = artworks.length - currentIndex;
		if (remainingArtworks <= 3 && hasMoreArtworks && !isLoading) {
			fetchArtworks(currentPage + 1, true);
		}
	}, [currentIndex, artworks.length, hasMoreArtworks, currentPage, isLoading, fetchArtworks]);

	// Preload next image
	useEffect(() => {
		if (artworks.length === 0) return;

		const nextIndex = (currentIndex + 1) % artworks.length;
		const nextArtwork = artworks[nextIndex];

		if (nextArtwork && nextArtwork.image_id) {
			const link = document.createElement('link');
			link.rel = 'preload';
			link.as = 'image';
			link.href = `/api/image?url=${encodeURIComponent(getImageUrl(nextArtwork.image_id))}`;
			document.head.appendChild(link);

			return () => {
				document.head.removeChild(link);
			};
		}
	}, [currentIndex, artworks]);

	// Auto-play carousel
	useEffect(() => {
		if (artworks.length === 0) return;

		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % artworks.length);
		}, autoPlayInterval);

		return () => clearInterval(interval);
	}, [artworks.length, autoPlayInterval]);

	// Get image URL using IIIF format
	// Standard IIIF format: /{identifier}/{region}/{size}/{rotation}/{quality}.{format}
	// The comma in size means width,height - 1200, means width 1200, height auto
	const getImageUrl = (imageId: string) => {
		return `https://www.artic.edu/iiif/2/${imageId}/full/1200,/0/default.jpg`;
	};

	// Navigate to previous image
	const goToPrevious = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex === 0 ? artworks.length - 1 : prevIndex - 1
		);
	};

	// Navigate to next image
	const goToNext = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % artworks.length);
	};

	// Navigate to specific index
	const goToSlide = (index: number) => {
		setCurrentIndex(index);
	};

	// Handle mouse move - track cursor position
	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		setMousePosition({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		});
	};

	// Handle mouse enter
	const handleMouseEnter = () => {
		setIsHovering(true);
	};

	// Handle mouse leave
	const handleMouseLeave = () => {
		setIsHovering(false);
	};

	// Generate URL slug from title
	const generateSlug = (title: string): string => {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
			.replace(/(^-|-$)/g, '') // Remove leading/trailing hyphens
			.substring(0, 100); // Limit length
	};

	// Handle image click - open artwork detail page
	const handleImageClick = (e: React.MouseEvent) => {
		// Don't trigger if clicking on navigation buttons or dots
		if ((e.target as HTMLElement).closest('.carousel-button, .carousel-dot')) {
			return;
		}

		// Construct artwork detail URL
		const artworkId = currentArtwork.id;
		const slug = currentArtwork.title ? generateSlug(currentArtwork.title) : '';
		const artworkUrl = slug
			? `https://www.artic.edu/artworks/${artworkId}/${slug}`
			: `https://www.artic.edu/artworks/${artworkId}`;

		window.open(artworkUrl, '_blank', 'noopener,noreferrer');
	};

	if (isLoading) {
		return (
			<div className="artwork-carousel">
				<div className="carousel-loading">
					<div className="loading-spinner"></div>
					<p>Loading artwork...</p>
				</div>
			</div>
		);
	}

	if (error || artworks.length === 0) {
		return (
			<div className="artwork-carousel">
				<div className="carousel-error">
					<p>{error || 'No artwork available'}</p>
				</div>
			</div>
		);
	}

	const currentArtwork = artworks[currentIndex];

	return (
		<div className="artwork-carousel">
			<div className="carousel-container">
				{/* Main Image */}
				<div
					className="carousel-image-wrapper"
					onClick={handleImageClick}
					onMouseMove={handleMouseMove}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					style={{ position: 'relative' }}
				>
					{/* Thumbnail / Placeholder - visible until main image loads */}
					{currentArtwork.thumbnail?.lqip && !isImageLoaded && (
						<NextImage
							src={currentArtwork.thumbnail.lqip}
							alt={currentArtwork.thumbnail?.alt_text || currentArtwork.title}
							className="carousel-image"
							fill
							sizes="100vw"
							style={{
								objectFit: 'cover',
								filter: 'blur(10px)',
								transform: 'scale(1.1)', // Prevent white edges from blur
								zIndex: 1
							}}
						/>
					)}

					{imageErrors.has(currentArtwork.image_id) && currentArtwork.thumbnail?.lqip ? (
						<NextImage
							src={currentArtwork.thumbnail.lqip}
							alt={currentArtwork.thumbnail?.alt_text || currentArtwork.title}
							className="carousel-image carousel-image-clickable"
							fill
							sizes="100vw"
							style={{ zIndex: 2, objectFit: 'cover' }}
						/>
					) : (
						<NextImage
							key={currentArtwork.image_id}
							src={`/api/image?url=${encodeURIComponent(getImageUrl(currentArtwork.image_id))}`}
							alt={currentArtwork.thumbnail?.alt_text || currentArtwork.title}
							className="carousel-image carousel-image-clickable"
							onLoad={() => setIsImageLoaded(true)}
							onError={() => {
								console.error('Image load failed for:', currentArtwork.image_id);
								// handleImageError(e, currentArtwork.image_id);
								setIsImageLoaded(true); // Remove loading state on error
							}}
							loading="eager"
							fill
							sizes="100vw"
							style={{
								opacity: isImageLoaded ? 1 : 0,
								transition: 'opacity 0.5s ease-in-out',
								zIndex: 2,
								objectFit: 'cover'
							}}
						/>
					)}
					{/* Mouse tracker shadow */}
					{isHovering && (
						<div
							className="carousel-mouse-shadow"
							style={{
								left: `${mousePosition.x}px`,
								top: `${mousePosition.y}px`,
							}}
						/>
					)}

					{/* Image Overlay with Title */}
					{currentArtwork.title && (
						<div className="carousel-overlay">
							<div className="carousel-info">
								<h3 className="carousel-title">{currentArtwork.title}</h3>
								{currentArtwork.artist_display && (
									<p className="carousel-artist">{currentArtwork.artist_display}</p>
								)}
							</div>
						</div>
					)}

					{/* Navigation Arrows */}
					<button
						className="carousel-button carousel-button-prev"
						onClick={goToPrevious}
						aria-label="Previous artwork"
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M15 18L9 12L15 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					<button
						className="carousel-button carousel-button-next"
						onClick={goToNext}
						aria-label="Next artwork"
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M9 18L15 12L9 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>

				{/* Dots Indicator */}
				{artworks.length > 1 && (
					<div className="carousel-dots">
						{artworks.map((_, index) => (
							<button
								key={index}
								className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
								onClick={() => goToSlide(index)}
								aria-label={`Go to slide ${index + 1}`}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default ArtworkCarousel;
