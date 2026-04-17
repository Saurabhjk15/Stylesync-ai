/**
 * Body Type Utilities
 * 
 * Uses MediaPipe Pose landmarks to calculate body measurements
 * and classify body type based on shoulder-to-hip ratios.
 * 
 * Key landmarks used:
 *  11 = left shoulder,  12 = right shoulder
 *  23 = left hip,       24 = right hip
 *  25 = left knee,      26 = right knee
 */

// Calculate distance between two landmarks
function distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// Calculate midpoint between two landmarks
function midpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Average multiple frames of MediaPipe landmarks for stability.
 * Reduces jitter from single-frame captures significantly.
 * @param {Array[]} frames - Array of landmark arrays (each with 33 points)
 * @returns {Array} Averaged landmark array
 */
export function averageLandmarks(frames) {
    if (!frames || frames.length === 0) return null;
    if (frames.length === 1) return frames[0];

    const count = frames.length;
    const numPoints = frames[0].length;
    const averaged = [];

    for (let i = 0; i < numPoints; i++) {
        let sumX = 0, sumY = 0, sumZ = 0, sumVis = 0;
        for (const frame of frames) {
            const lm = frame[i] || {};
            sumX += lm.x || 0;
            sumY += lm.y || 0;
            sumZ += lm.z || 0;
            sumVis += lm.visibility || 0;
        }
        averaged.push({
            x: sumX / count,
            y: sumY / count,
            z: sumZ / count,
            visibility: sumVis / count,
        });
    }
    return averaged;
}


/**
 * Extract body measurements from MediaPipe Pose landmarks.
 * All values are relative pixel ratios (not actual cm).
 * Only SHOULDERS are required — hips are estimated if not visible.
 */
export function calculateMeasurements(landmarks) {
    if (!landmarks || landmarks.length < 33) return null;

    const leftShoulder  = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip       = landmarks[23];
    const rightHip      = landmarks[24];
    const leftKnee      = landmarks[25];
    const rightKnee     = landmarks[26];

    // ONLY require shoulders — hips often hidden by desk/chair
    const MIN_SHOULDER_VIS = 0.25;
    if ((leftShoulder?.visibility  || 0) < MIN_SHOULDER_VIS) return null;
    if ((rightShoulder?.visibility || 0) < MIN_SHOULDER_VIS) return null;

    const shoulderWidth = distance(leftShoulder, rightShoulder);

    // Use actual hip landmarks if visible, otherwise estimate from shoulder width
    const MIN_HIP_VIS = 0.20;
    const hipsVisible =
        (leftHip?.visibility  || 0) >= MIN_HIP_VIS &&
        (rightHip?.visibility || 0) >= MIN_HIP_VIS;

    let hipWidth;
    if (hipsVisible) {
        hipWidth = distance(leftHip, rightHip);
    } else {
        // Standard body proportion: average hip width ≈ 95% of shoulder width
        // This is a safe estimate for frontal-camera users sitting at a desk
        hipWidth = shoulderWidth * 0.95;
    }

    const shoulderMid = midpoint(leftShoulder, rightShoulder);

    // Estimate hip midpoint if not detected
    const hipMid = hipsVisible
        ? midpoint(leftHip, rightHip)
        : { x: shoulderMid.x, y: shoulderMid.y + shoulderWidth * 1.2 };

    const torsoLength = distance(shoulderMid, hipMid);

    // Estimated waist width (interpolation between shoulder and hip width)
    const waistWidth = shoulderWidth * 0.4 + hipWidth * 0.6;

    // Leg length (hip to knee) — optional
    let legLength = torsoLength * 1.2; // default estimate
    if (hipsVisible && leftKnee && rightKnee &&
        (leftKnee.visibility  || 0) >= MIN_HIP_VIS &&
        (rightKnee.visibility || 0) >= MIN_HIP_VIS) {
        legLength = (distance(leftHip, leftKnee) + distance(rightHip, rightKnee)) / 2;
    }

    return {
        shoulderWidth:      Math.round(shoulderWidth * 1000) / 1000,
        hipWidth:           Math.round(hipWidth * 1000) / 1000,
        waistWidth:         Math.round(waistWidth * 1000) / 1000,
        torsoLength:        Math.round(torsoLength * 1000) / 1000,
        legLength:          Math.round(legLength * 1000) / 1000,
        shoulderToHipRatio: Math.round((shoulderWidth / hipWidth) * 100) / 100,
        waistToHipRatio:    Math.round((waistWidth / hipWidth) * 100) / 100,
        hipsEstimated:      !hipsVisible, // flag so UI can inform user
    };
}


/**
 * Classify body type based on measurement ratios.
 * 
 * Body types:
 *  - hourglass:          shoulder ≈ hip, narrow waist
 *  - pear (triangle):    hips wider than shoulders
 *  - inverted-triangle:  shoulders wider than hips
 *  - rectangle:          shoulder ≈ hip ≈ waist (straight)
 *  - apple (oval):       wider midsection
 */
export function classifyBodyType(measurements) {
    if (!measurements) return 'rectangle'; // default

    const { shoulderToHipRatio, waistToHipRatio } = measurements;

    // Pear: hips significantly wider than shoulders
    if (shoulderToHipRatio < 0.9) {
        return 'pear';
    }

    // Inverted triangle: shoulders significantly wider than hips
    if (shoulderToHipRatio > 1.15) {
        return 'inverted-triangle';
    }

    // Shoulders and hips roughly equal — check waist
    // Hourglass: defined waist (waist much narrower than hips)
    if (waistToHipRatio < 0.75) {
        return 'hourglass';
    }

    // Apple: waist wider than hips (rare with pose estimation)
    if (waistToHipRatio > 0.95) {
        return 'apple';
    }

    // Rectangle: everything roughly the same
    return 'rectangle';
}

/**
 * Get dynamic, personalized style tips based on specific measurements and occasion.
 */
export function getBodyTypeInfo(bodyType, occasion = 'casual', measurements = null) {
    const info = {
        hourglass: {
            label: 'Hourglass',
            emoji: '⏳',
            description: 'Defined by balanced shoulders and hips with a distinctly narrow waist. Your silhouette naturally draws the eye to the center.',
            baseTips: ['Highlight your defined waistline', 'Maintain your natural balance', 'Avoid shapeless, baggy clothing'],
            bestStyles: ['Wrap dresses', 'Fitted tops', 'High-waist trousers', 'Belted outerwear', 'V-necklines'],
        },
        pear: {
            label: 'Pear',
            emoji: '🍐',
            description: 'Characterized by hips that are wider than the shoulders. Your lower body is fuller, creating a grounded, feminine curve.',
            baseTips: ['Draw attention upward to balance proportions', 'Define your waist', 'Structure the shoulders'],
            bestStyles: ['A-line skirts', 'Structured blazers', 'Boat neck tops', 'Statement necklaces', 'Darker bottoms'],
        },
        'inverted-triangle': {
            label: 'Inverted Triangle',
            emoji: '🔻',
            description: 'Defined by shoulders that are broader than the hips. Your silhouette taps into a natural athletic presence.',
            baseTips: ['Soften broad shoulders', 'Add volume to hips', 'Elongate the neckline'],
            bestStyles: ['V-neck tops', 'Wide-leg trousers', 'A-line dresses', 'Full skirts', 'Raglan sleeves'],
        },
        rectangle: {
            label: 'Rectangle',
            emoji: '▬',
            description: 'Characterized by similar widths for shoulders, waist, and hips. Your athletic frame is versatile and takes structure well.',
            baseTips: ['Create curves with structure', 'Define your waist', 'Play with volume'],
            bestStyles: ['Peplum tops', 'Belted dresses', 'Layered outfits', 'Ruffles and embellishments', 'Crop tops'],
        },
        apple: {
            label: 'Apple',
            emoji: '🍎',
            description: 'Defined by a fuller midsection with narrower hips and shoulders. Your legs are often a key asset to highlight.',
            baseTips: ['Elongate torso with vertical lines', 'Show off legs', 'Draw attention to the neckline'],
            bestStyles: ['Empire waist', 'V-neck tops', 'Straight-leg pants', 'Tunics', 'Structured jackets'],
        },
    };

    const typeData = info[bodyType] || info.rectangle;

    // 1. Occasion-specific Tips (Enhanced Luxury Narrative)
    const occasionTips = {
        casual: {
            hourglass: ['Combine fitted tees with high-waisted denim to celebrate your curves.', 'Cropped cardigans maintain your waist definition even in relaxed settings.'],
            pear: ['Dark wash denim streamlines the hips, while bright, detailed tops draw the eye upward.', 'Open jackets create vertical lines that elongate the frame.'],
            'inverted-triangle': ['Deep V-neck tees break up the shoulder line effectively.', 'Boyfriend jeans add necessary volume to the lower body for balance.'],
            rectangle: ['Tuck graphic tees into high-waisted shorts to create an artificial waistline.', 'Ruffled tops add softness and dimension to your athletic frame.'],
            apple: ['Flowy tunics offer comfort without sacrificing style.', 'Leggings paired with long, structured shirts highlight your legs while skimming the midsection.'],
        },
        formal: {
            hourglass: ['A tailored sheath dress is your power piece; ensuring the waist is perfectly fitted is key.', 'Belted trenches offer a sophisticated outer layer that respects your silhouette.'],
            pear: ['A-line gowns skim over hips gracefully, while embellished necklines captivate attention.', 'Off-the-shoulder styles balance hip width with elegance.'],
            'inverted-triangle': ['Single-breasted blazers streamline the upper body.', 'Wide-leg trousers in luxe fabrics create a statuesque, balanced column.'],
            rectangle: ['Structured blazers with distinct belts carve out a dramatic waistline.', 'Wrap gowns induce curves and offer a timeless, feminine drape.'],
            apple: ['Monochrome suits create a continuous, elongating vertical line.', 'Empire waist gowns naturally highlight the narrowest point under the bust.'],
        },
        office: {
            hourglass: ['Pencil skirts were made for you; pair with a tucked-in silk blouse.', 'Fitted blazers that nip in at the waist command authority and grace.'],
            pear: ['Bootcut trousers balance hip curves with a slight flare at the hem.', 'Colorful, patterned blouses keep the focus on your face during meetings.'],
            'inverted-triangle': ['Open collars and lapel-less jackets soften the shoulder line.', 'Flared slacks provide a professional counterweight to broader shoulders.'],
            rectangle: ['Peplum jackets instantly create a waist-hip ratio.', 'Belted shirt dresses offer structured professionalism with a feminine touch.'],
            apple: ['Long vests create sleek vertical lines over simple bases.', 'Dark, unbuttoned blazers frame your torso effectively without constriction.'],
        },
        party: {
            hourglass: ['Bodycon dresses celebrate your natural symmetry.', 'Jumpsuits with defined waists offer a modern, chic alternative to cocktail dresses.'],
            pear: ['Fit-and-flare dresses are your best friend for dancing and movement.', 'Statement earrings and halter necklines draw all eyes up.'],
            'inverted-triangle': ['Plunging V-necks are dramatic and flattering.', 'Full skirts or tulle add festive volume to your lower half.'],
            rectangle: ['Cut-out dresses create optical illusions of curves.', 'Sequins and textures add dimension exactly where you want it.'],
            apple: ['Shift dresses offer freedom of movement and retro glamour.', 'Short hemlines highlight your legs—pair with statement heels.'],
        },
        wedding: {
            hourglass: ['Mermaid silhouettes mimic your natural lines perfectly.', 'Sweetheart necklines frame the face while respecting your proportions.'],
            pear: ['Detailed bodices with simpler, flowing skirts create a dreamlike balance.', 'A-line cuts are universally flattering and comfortable for long events.'],
            'inverted-triangle': ['Halter necks draw the eye inward, minimizing shoulder width.', 'Ballgown skirts provide the ultimate volume to counter-balance the upper body.'],
            rectangle: ['Ruched dresses add texture and the illusion of softness.', 'Voluminous skirts give you a princess-like presence.'],
            apple: ['Empire silhouettes glide over the midsection for ethereal elegance.', 'Chiffon fabrics offer movement and grace without bulk.'],
        },
        sporty: {
            hourglass: ['High-waisted leggings with matching crop tops.', 'Fitted zip-up jackets.'],
            pear: ['Color-blocked leggings with dark side panels.', 'Bright, attention-grabbing sports bras.'],
            'inverted-triangle': ['Racerback tanks to show off shoulders.', 'Patterned leggings to add volume.'],
            rectangle: ['Details at the waist like drawstrings.', 'Layered tanks.'],
            apple: ['Longer line tank tops.', 'Compression leggings for support.'],
        },
        beach: {
            hourglass: ['Retro high-waisted bikinis.', 'Belted kaftans.'],
            pear: ['Patterned tops with solid bottoms.', 'Sarongs tied at the waist.'],
            'inverted-triangle': ['Halter bikinis.', 'Board shorts or skirted bottoms.'],
            rectangle: ['Cut-out one-pieces.', 'Ruffled bikinis.'],
            apple: ['Tankinis with ruching.', 'Flowy beach cover-ups.']
        },
        date: {
            hourglass: ['Wrap dresses in soft fabrics.', 'Fitted bodysuits with midi skirts.'],
            pear: ['Off-shoulder tops.', 'A-line skirts.'],
            'inverted-triangle': ['V-neck camisoles.', 'Wide-leg culottes.'],
            rectangle: ['Fit-and-flare dresses.', 'Tops with sweetheart necklines.'],
            apple: ['Empire waist dresses.', 'Tunics with leggings.']
        }
    };

    // 2. Personalized Measurement Tips
    // Uses the actual ratios to give specific advice
    const ratioTips = [];
    if (measurements) {
        const { shoulderToHipRatio, waistToHipRatio } = measurements;

        // Dynamic advice based on specific numbers
        if (waistToHipRatio < 0.70) {
            ratioTips.push(`Your waist ratio is ${waistToHipRatio} - extremely defined! Emphasize it with wide belts.`);
        } else if (waistToHipRatio > 0.85) {
            ratioTips.push(`With a waist ratio of ${waistToHipRatio}, try empire waists or semi-fitted styles.`);
        }

        if (shoulderToHipRatio > 1.2) {
            ratioTips.push("Your shoulders are prominent - try raglan sleeves to soften them.");
        } else if (shoulderToHipRatio < 0.85) {
            ratioTips.push("Your hips are the star! Balance with structured shoulders or boat necks.");
        }
    }

    // 3. Selection
    // Get occasion tips (fallback to casual)
    const specificOccasionTips = (occasionTips[occasion] && occasionTips[occasion][bodyType])
        || occasionTips['casual'][bodyType];

    // Combine: 1 Base Tip + 1 Occasion Tip + 1 Personal Ratio Tip (if available)
    const finalTips = [
        typeData.baseTips[Math.floor(Math.random() * typeData.baseTips.length)], // Random base tip
        specificOccasionTips[Math.floor(Math.random() * specificOccasionTips.length)], // Random occasion tip
        ...(ratioTips.length > 0 ? [ratioTips[0]] : []) // Personal tip
    ];

    if (finalTips.length < 3) {
        finalTips.push("Wear what makes you feel confident!");
    }

    return {
        ...typeData,
        tips: finalTips
    };
}

/**
 * Detect skin tone from pixel data (simplified approach).
 * Takes a small region of face/neck area and averages the color.
 * Returns: 'fair', 'light', 'medium', 'olive', 'brown', 'dark'
 */
export function detectSkinTone(imageData, faceLandmarks) {
    // If no face data, return medium as default
    if (!imageData || !faceLandmarks) return 'medium';

    // Sample pixels from cheek area (landmarks 1 and 4 in face mesh)
    // For pose landmarks, use area between nose (0) and shoulders
    const noseLandmark = faceLandmarks[0];
    if (!noseLandmark) return 'medium';

    const sampleX = Math.floor(noseLandmark.x * imageData.width);
    const sampleY = Math.floor(noseLandmark.y * imageData.height);

    // Average a 10x10 pixel region
    let totalR = 0, totalG = 0, totalB = 0, count = 0;
    for (let dy = -5; dy < 5; dy++) {
        for (let dx = -5; dx < 5; dx++) {
            const px = sampleX + dx;
            const py = sampleY + dy;
            if (px >= 0 && px < imageData.width && py >= 0 && py < imageData.height) {
                const idx = (py * imageData.width + px) * 4;
                totalR += imageData.data[idx];
                totalG += imageData.data[idx + 1];
                totalB += imageData.data[idx + 2];
                count++;
            }
        }
    }

    if (count === 0) return 'medium';

    const avgR = totalR / count;
    const avgG = totalG / count;
    const avgB = totalB / count;
    const brightness = (avgR + avgG + avgB) / 3;

    // Simple brightness-based classification
    if (brightness > 210) return 'fair';
    if (brightness > 185) return 'light';
    if (brightness > 160) return 'medium';
    if (brightness > 130) return 'olive';
    if (brightness > 90) return 'brown';
    return 'dark';
}
