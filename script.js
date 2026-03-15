document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li a');
    const navbar = document.getElementById('navbar');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const scatterPhotos = Array.from(document.querySelectorAll('.scatter-photo'));
    const storyWrapper = document.querySelector('.story-content-wrapper');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const storyEditorEnabled = new URLSearchParams(window.location.search).get('storyEditor') === '1';
    const STORY_LAYOUT_STORAGE_KEY = 'wedding-story-photo-layout-v1';
    const STORY_LAYOUT_BREAKPOINT = 768;

    let storyLayouts = {
        desktop: null,
        mobile: null
    };
    let storyLayoutEditor = null;
    let selectedStoryPhoto = null;
    let activeStoryDrag = null;
    let activeStoryPress = null;
    let wasDesktopStoryViewport = window.innerWidth > STORY_LAYOUT_BREAKPOINT;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const round = (value, digits = 2) => Number.parseFloat(value.toFixed(digits));
    const getPhotoKey = (photo) => Array.from(photo.classList).find((className) => /^photo-\d+$/.test(className));
    const isDesktopStoryViewport = () => window.innerWidth > STORY_LAYOUT_BREAKPOINT;
    const getStoryViewportProfile = () => (isDesktopStoryViewport() ? 'desktop' : 'mobile');
    const getStoryViewportLabel = () => (isDesktopStoryViewport() ? 'Desktop' : 'Mobile');
    const clearMobileStoryPhotoState = (exceptPhoto = null) => {
        scatterPhotos.forEach((photo) => {
            if (photo !== exceptPhoto) {
                photo.classList.remove('mobile-active');
            }
        });

        if (!exceptPhoto) {
            activeStoryPress = null;
        }
    };

    const activateMobileStoryPhoto = (photo) => {
        clearMobileStoryPhotoState(photo);
        photo.classList.add('mobile-active');
        activeStoryPress = photo;
    };

    const releaseMobileStoryPhoto = (photo) => {
        photo.classList.remove('mobile-active');

        if (activeStoryPress === photo) {
            activeStoryPress = null;
        }
    };

    const readStoryLayouts = () => {
        try {
            const rawValue = window.localStorage.getItem(STORY_LAYOUT_STORAGE_KEY);
            if (!rawValue) {
                return { desktop: null, mobile: null };
            }

            const parsed = JSON.parse(rawValue);
            if (parsed && (parsed.desktop || parsed.mobile)) {
                return {
                    desktop: parsed.desktop || null,
                    mobile: parsed.mobile || null
                };
            }

            return {
                desktop: parsed || null,
                mobile: null
            };
        } catch (error) {
            return { desktop: null, mobile: null };
        }
    };

    const writeStoryLayouts = (layouts) => {
        try {
            window.localStorage.setItem(STORY_LAYOUT_STORAGE_KEY, JSON.stringify(layouts));
            return true;
        } catch (error) {
            return false;
        }
    };

    const clearStoryLayouts = () => {
        try {
            window.localStorage.removeItem(STORY_LAYOUT_STORAGE_KEY);
        } catch (error) {
            // Ignore storage failures and keep the live reset.
        }
    };

    const getPhotoRotation = (photo) => {
        const computedStyles = window.getComputedStyle(photo);
        return Number.parseFloat(computedStyles.getPropertyValue('--photo-rotation')) || 0;
    };

    const getPhotoScale = (photo) => {
        const computedStyles = window.getComputedStyle(photo);
        return Number.parseFloat(computedStyles.getPropertyValue('--photo-scale')) || 1;
    };

    const collectPhotoLayout = (photo) => {
        const wrapperWidth = storyWrapper.clientWidth || storyWrapper.getBoundingClientRect().width;
        const wrapperHeight = storyWrapper.clientHeight || storyWrapper.getBoundingClientRect().height;

        return {
            top: round((photo.offsetTop / wrapperHeight) * 100),
            left: round((photo.offsetLeft / wrapperWidth) * 100),
            width: round((photo.offsetWidth / wrapperWidth) * 100),
            rotation: round(getPhotoRotation(photo)),
            scale: round(getPhotoScale(photo))
        };
    };

    const applyPhotoLayout = (photo, layout) => {
        photo.style.setProperty('--photo-top', `${round(layout.top)}%`);
        photo.style.setProperty('--photo-right', 'auto');
        photo.style.setProperty('--photo-bottom', 'auto');
        photo.style.setProperty('--photo-left', `${round(layout.left)}%`);
        photo.style.setProperty('--photo-width', `${round(layout.width)}%`);
        photo.style.setProperty('--photo-rotation', `${round(layout.rotation)}deg`);
        photo.style.setProperty('--photo-scale', `${round(layout.scale ?? 1)}`);
    };

    const clearPhotoLayoutOverrides = (photo) => {
        photo.style.removeProperty('--photo-top');
        photo.style.removeProperty('--photo-right');
        photo.style.removeProperty('--photo-bottom');
        photo.style.removeProperty('--photo-left');
        photo.style.removeProperty('--photo-width');
        photo.style.removeProperty('--photo-rotation');
        photo.style.removeProperty('--photo-scale');
    };

    const applyStoryLayoutMap = (layoutMap) => {
        scatterPhotos.forEach((photo) => {
            const key = getPhotoKey(photo);
            if (key && layoutMap && layoutMap[key]) {
                applyPhotoLayout(photo, layoutMap[key]);
            } else {
                clearPhotoLayoutOverrides(photo);
            }
        });
    };

    const collectStoryLayoutMap = () => {
        const layoutMap = {};
        scatterPhotos.forEach((photo) => {
            const key = getPhotoKey(photo);
            if (key) {
                layoutMap[key] = collectPhotoLayout(photo);
            }
        });
        return layoutMap;
    };

    const buildStoryLayoutCssBlock = (layoutMap) => {
        const lines = [];

        scatterPhotos.forEach((photo) => {
            const key = getPhotoKey(photo);
            if (!key || !layoutMap || !layoutMap[key]) {
                return;
            }

            const layout = layoutMap[key];
            lines.push(`${key.replace(/^/, '.')} {`);
            lines.push(`    --photo-top: ${round(layout.top)}%;`);
            lines.push(`    --photo-left: ${round(layout.left)}%;`);
            lines.push(`    --photo-width: ${round(layout.width)}%;`);
            lines.push(`    --photo-rotation: ${round(layout.rotation)}deg;`);
            lines.push(`    --photo-scale: ${round(layout.scale ?? 1)};`);
            lines.push('}');
        });

        return lines.join('\n');
    };

    const buildStoryLayoutCss = (layouts) => {
        const lines = ['/* Story section photo layout */'];
        const desktopBlock = layouts.desktop ? buildStoryLayoutCssBlock(layouts.desktop) : '';
        const mobileBlock = layouts.mobile ? buildStoryLayoutCssBlock(layouts.mobile) : '';

        if (desktopBlock) {
            lines.push(desktopBlock);
        }

        if (mobileBlock) {
            if (desktopBlock) {
                lines.push('');
            }
            lines.push('@media (max-width: 768px) {');
            mobileBlock.split('\n').forEach((line) => {
                lines.push(`    ${line}`);
            });
            lines.push('}');
        }

        return lines.join('\n');
    };

    const getStoryLayoutSnapshot = () => {
        const profile = getStoryViewportProfile();
        return {
            desktop: profile === 'desktop' ? collectStoryLayoutMap() : (storyLayouts.desktop || null),
            mobile: profile === 'mobile' ? collectStoryLayoutMap() : (storyLayouts.mobile || null)
        };
    };

    const setStoryEditorStatus = (message) => {
        if (storyLayoutEditor) {
            storyLayoutEditor.status.textContent = message;
        }
    };

    const setStoryEditorExport = (text) => {
        if (storyLayoutEditor) {
            storyLayoutEditor.output.value = text;
        }
    };

    const syncStoryEditorViewportLabel = () => {
        if (storyLayoutEditor) {
            storyLayoutEditor.viewport.textContent = `${getStoryViewportLabel()} layout`;
        }
    };

    const syncStoryEditorInputs = () => {
        if (!storyLayoutEditor || !selectedStoryPhoto) {
            return;
        }

        const layout = collectPhotoLayout(selectedStoryPhoto);
        storyLayoutEditor.select.value = getPhotoKey(selectedStoryPhoto) || '';
        storyLayoutEditor.inputs.top.value = layout.top;
        storyLayoutEditor.inputs.left.value = layout.left;
        storyLayoutEditor.inputs.width.value = layout.width;
        storyLayoutEditor.inputs.rotation.value = layout.rotation;
        storyLayoutEditor.inputs.scale.value = layout.scale;
    };

    const selectStoryPhoto = (photo) => {
        selectedStoryPhoto = photo;

        scatterPhotos.forEach((item) => {
            item.classList.toggle('is-selected', item === photo);
        });

        syncStoryEditorInputs();
    };

    const updateSelectedStoryPhotoFromInputs = () => {
        if (!selectedStoryPhoto || !storyLayoutEditor) {
            return;
        }

        const nextLayout = {
            top: Number.parseFloat(storyLayoutEditor.inputs.top.value) || 0,
            left: Number.parseFloat(storyLayoutEditor.inputs.left.value) || 0,
            width: clamp(Number.parseFloat(storyLayoutEditor.inputs.width.value) || 16, 6, 40),
            rotation: Number.parseFloat(storyLayoutEditor.inputs.rotation.value) || 0,
            scale: clamp(Number.parseFloat(storyLayoutEditor.inputs.scale.value) || 1, 0.4, 2.5)
        };

        applyPhotoLayout(selectedStoryPhoto, nextLayout);
        syncStoryEditorInputs();
        setStoryEditorStatus(`Unsaved ${getStoryViewportLabel().toLowerCase()} changes. Click Save to persist this layout in this browser.`);
    };

    const syncStoryLayoutForViewport = () => {
        if (!storyWrapper || scatterPhotos.length === 0) {
            return;
        }

        const profile = getStoryViewportProfile();
        const activeLayout = storyLayouts[profile];
        applyStoryLayoutMap(activeLayout);

        if (storyLayoutEditor) {
            syncStoryEditorViewportLabel();
            syncStoryEditorInputs();
            if (activeLayout) {
                setStoryEditorStatus(`Saved ${getStoryViewportLabel().toLowerCase()} layout loaded from this browser.`);
            } else {
                setStoryEditorStatus(`Using ${getStoryViewportLabel().toLowerCase()} stylesheet defaults. Drag photos, then click Save.`);
            }
        }
    };

    const persistCurrentStoryLayout = () => {
        const profile = getStoryViewportProfile();
        storyLayouts[profile] = collectStoryLayoutMap();

        const exportCss = buildStoryLayoutCss(getStoryLayoutSnapshot());
        const saved = writeStoryLayouts(storyLayouts);

        setStoryEditorExport(exportCss);
        setStoryEditorStatus(saved
            ? `Saved ${getStoryViewportLabel().toLowerCase()} layout to this browser. Export CSS if you want to make it permanent in the files.`
            : `The ${getStoryViewportLabel().toLowerCase()} layout changed, but browser storage is blocked. Use Export CSS to keep these positions.`);
    };

    const resetStoryLayout = () => {
        const profile = getStoryViewportProfile();
        storyLayouts[profile] = null;

        if (!storyLayouts.desktop && !storyLayouts.mobile) {
            clearStoryLayouts();
        } else {
            writeStoryLayouts(storyLayouts);
        }

        applyStoryLayoutMap(null);
        setStoryEditorExport(buildStoryLayoutCss(storyLayouts));

        window.requestAnimationFrame(() => {
            if (scatterPhotos.length > 0) {
                selectStoryPhoto(selectedStoryPhoto || scatterPhotos[0]);
            }
            setStoryEditorStatus(`Reset ${getStoryViewportLabel().toLowerCase()} layout to stylesheet defaults.`);
        });
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            return false;
        }
    };

    const exportCurrentStoryLayout = async () => {
        const exportCss = buildStoryLayoutCss(getStoryLayoutSnapshot());
        setStoryEditorExport(exportCss);

        const copied = await copyToClipboard(exportCss);
        setStoryEditorStatus(copied
            ? 'Exported CSS and copied it to your clipboard.'
            : 'Exported CSS into the panel. Clipboard access was not available.');
    };

    const buildStoryLayoutEditor = () => {
        document.body.classList.add('story-layout-editor-mode');

        const panel = document.createElement('aside');
        panel.className = 'story-layout-editor';
        panel.innerHTML = `
            <span class="story-layout-editor-badge">Internal Tool</span>
            <h3>Story Photo Layout</h3>
            <p class="story-layout-editor-copy">Drag the photos around the note card. Desktop and mobile layouts save separately, based on your current viewport.</p>
            <p class="story-layout-editor-copy" data-role="viewport"></p>
            <label class="story-layout-editor-field">
                Selected Photo
                <select data-role="photo-select"></select>
            </label>
            <div class="story-layout-editor-grid">
                <label class="story-layout-editor-field">
                    Top %
                    <input data-role="top" type="number" step="0.1">
                </label>
                <label class="story-layout-editor-field">
                    Left %
                    <input data-role="left" type="number" step="0.1">
                </label>
                <label class="story-layout-editor-field">
                    Width %
                    <input data-role="width" type="number" min="6" max="40" step="0.1">
                </label>
                <label class="story-layout-editor-field">
                    Rotation
                    <input data-role="rotation" type="number" step="0.1">
                </label>
                <label class="story-layout-editor-field">
                    Scale
                    <input data-role="scale" type="number" min="0.4" max="2.5" step="0.05">
                </label>
            </div>
            <div class="story-layout-editor-actions">
                <button type="button" data-action="save">Save</button>
                <button type="button" data-action="reset">Reset</button>
                <button type="button" data-action="export">Export CSS</button>
                <button type="button" data-action="clear-export">Clear Export</button>
            </div>
            <label class="story-layout-editor-field">
                Export Output
                <textarea data-role="export" readonly spellcheck="false"></textarea>
            </label>
            <p class="story-layout-editor-status" data-role="status"></p>
        `;

        document.body.appendChild(panel);

        storyLayoutEditor = {
            panel,
            select: panel.querySelector('[data-role="photo-select"]'),
            viewport: panel.querySelector('[data-role="viewport"]'),
            inputs: {
                top: panel.querySelector('[data-role="top"]'),
                left: panel.querySelector('[data-role="left"]'),
                width: panel.querySelector('[data-role="width"]'),
                rotation: panel.querySelector('[data-role="rotation"]'),
                scale: panel.querySelector('[data-role="scale"]')
            },
            output: panel.querySelector('[data-role="export"]'),
            status: panel.querySelector('[data-role="status"]')
        };

        scatterPhotos.forEach((photo, index) => {
            const key = getPhotoKey(photo);
            if (!key) {
                return;
            }

            const option = document.createElement('option');
            option.value = key;
            option.textContent = `Photo ${index + 1}`;
            storyLayoutEditor.select.appendChild(option);
        });

        storyLayoutEditor.select.addEventListener('change', () => {
            const nextPhoto = scatterPhotos.find((photo) => getPhotoKey(photo) === storyLayoutEditor.select.value);
            if (nextPhoto) {
                selectStoryPhoto(nextPhoto);
            }
        });

        Object.values(storyLayoutEditor.inputs).forEach((input) => {
            input.addEventListener('input', updateSelectedStoryPhotoFromInputs);
        });

        panel.querySelector('[data-action="save"]').addEventListener('click', persistCurrentStoryLayout);
        panel.querySelector('[data-action="reset"]').addEventListener('click', resetStoryLayout);
        panel.querySelector('[data-action="export"]').addEventListener('click', exportCurrentStoryLayout);
        panel.querySelector('[data-action="clear-export"]').addEventListener('click', () => {
            setStoryEditorExport('');
            setStoryEditorStatus('Cleared export output.');
        });

        setStoryEditorExport(buildStoryLayoutCss(storyLayouts));
        syncStoryEditorViewportLabel();

        if (scatterPhotos.length > 0) {
            selectStoryPhoto(scatterPhotos[0]);
        }
    };

    const stopStoryDrag = (pointerId) => {
        if (!activeStoryDrag || (pointerId !== undefined && pointerId !== activeStoryDrag.pointerId)) {
            return;
        }

        const { photo } = activeStoryDrag;
        photo.classList.remove('is-dragging');

        if (photo.releasePointerCapture) {
            try {
                photo.releasePointerCapture(activeStoryDrag.pointerId);
            } catch (error) {
                // Pointer capture may already be released.
            }
        }

        activeStoryDrag = null;
        window.removeEventListener('pointermove', handleStoryDragMove);
        window.removeEventListener('pointerup', handleStoryDragEnd);
        window.removeEventListener('pointercancel', handleStoryDragEnd);
    };

    const handleStoryDragMove = (event) => {
        if (!activeStoryDrag || event.pointerId !== activeStoryDrag.pointerId) {
            return;
        }

        const wrapperRect = storyWrapper.getBoundingClientRect();
        const currentLayout = collectPhotoLayout(activeStoryDrag.photo);
        const scale = currentLayout.scale || 1;
        const widthPx = activeStoryDrag.photo.offsetWidth * scale;
        const heightPx = (activeStoryDrag.photo.offsetHeight || activeStoryDrag.photo.offsetWidth) * scale;

        let leftPx = event.clientX - wrapperRect.left - activeStoryDrag.offsetX;
        let topPx = event.clientY - wrapperRect.top - activeStoryDrag.offsetY;

        leftPx = clamp(leftPx, -widthPx * 0.45, wrapperRect.width - (widthPx * 0.55));
        topPx = clamp(topPx, -heightPx * 0.35, wrapperRect.height - (heightPx * 0.65));

        applyPhotoLayout(activeStoryDrag.photo, {
            top: (topPx / wrapperRect.height) * 100,
            left: (leftPx / wrapperRect.width) * 100,
            width: currentLayout.width,
            rotation: currentLayout.rotation,
            scale: currentLayout.scale
        });

        if (selectedStoryPhoto === activeStoryDrag.photo) {
            syncStoryEditorInputs();
        }

        setStoryEditorStatus(`Unsaved ${getStoryViewportLabel().toLowerCase()} changes. Click Save to persist this layout in this browser.`);
    };

    function handleStoryDragEnd(event) {
        stopStoryDrag(event ? event.pointerId : undefined);
    }

    const handleStoryDragStart = (event) => {
        if (!storyEditorEnabled || !storyLayoutEditor) {
            return;
        }

        if (event.button !== undefined && event.button !== 0) {
            return;
        }

        event.preventDefault();

        const photo = event.currentTarget;
        const wrapperRect = storyWrapper.getBoundingClientRect();
        const offsetX = event.clientX - wrapperRect.left - photo.offsetLeft;
        const offsetY = event.clientY - wrapperRect.top - photo.offsetTop;

        selectStoryPhoto(photo);
        photo.classList.add('is-dragging');

        if (photo.setPointerCapture) {
            try {
                photo.setPointerCapture(event.pointerId);
            } catch (error) {
                // Some browsers may reject pointer capture for this event.
            }
        }

        activeStoryDrag = {
            pointerId: event.pointerId,
            photo,
            offsetX,
            offsetY
        };

        window.addEventListener('pointermove', handleStoryDragMove);
        window.addEventListener('pointerup', handleStoryDragEnd);
        window.addEventListener('pointercancel', handleStoryDragEnd);
    };

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navItems.forEach((item) => {
            item.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    if (navbar && !navbar.hasAttribute('data-static-scrolled')) {
        const updateNavbar = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        };

        updateNavbar();
        window.addEventListener('scroll', updateNavbar, { passive: true });
    }

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.14,
            rootMargin: '0px 0px -40px 0px'
        });

        animatedElements.forEach((element) => {
            revealObserver.observe(element);
        });

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const id = entry.target.getAttribute('id');
                if (!id || !entry.isIntersecting) {
                    return;
                }

                navItems.forEach((link) => {
                    const matches = link.getAttribute('href') === `#${id}`;
                    link.classList.toggle('is-active', matches);
                });
            });
        }, {
            threshold: 0.45,
            rootMargin: '-20% 0px -30% 0px'
        });

        document.querySelectorAll('section[id]').forEach((section) => {
            sectionObserver.observe(section);
        });
    } else {
        animatedElements.forEach((element) => {
            element.classList.add('is-visible');
        });
    }

    if (scatterPhotos.length > 0 && storyWrapper) {
        storyLayouts = readStoryLayouts();
        syncStoryLayoutForViewport();

        if (storyEditorEnabled) {
            buildStoryLayoutEditor();

            scatterPhotos.forEach((photo) => {
                photo.addEventListener('pointerdown', handleStoryDragStart);
                photo.addEventListener('click', () => selectStoryPhoto(photo));
            });
        }

        scatterPhotos.forEach((photo) => {
            if ('PointerEvent' in window) {
                photo.addEventListener('pointerdown', (event) => {
                    if (storyEditorEnabled || (event.pointerType !== 'touch' && event.pointerType !== 'pen')) {
                        return;
                    }

                    activateMobileStoryPhoto(photo);

                    if (photo.setPointerCapture) {
                        try {
                            photo.setPointerCapture(event.pointerId);
                        } catch (error) {
                            // Some browsers can reject pointer capture for passive press effects.
                        }
                    }
                }, { passive: true });

                photo.addEventListener('pointerup', (event) => {
                    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
                        releaseMobileStoryPhoto(photo);
                    }
                }, { passive: true });

                photo.addEventListener('pointercancel', (event) => {
                    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
                        releaseMobileStoryPhoto(photo);
                    }
                }, { passive: true });

                photo.addEventListener('lostpointercapture', () => {
                    releaseMobileStoryPhoto(photo);
                }, { passive: true });
            } else {
                photo.addEventListener('touchstart', () => {
                    if (storyEditorEnabled) {
                        return;
                    }

                    activateMobileStoryPhoto(photo);
                }, { passive: true });

                photo.addEventListener('touchend', () => {
                    releaseMobileStoryPhoto(photo);
                }, { passive: true });

                photo.addEventListener('touchcancel', () => {
                    releaseMobileStoryPhoto(photo);
                }, { passive: true });
            }
        });

        if ('PointerEvent' in window) {
            document.addEventListener('pointerdown', (event) => {
                if (storyEditorEnabled || (event.pointerType !== 'touch' && event.pointerType !== 'pen')) {
                    return;
                }

                if (!event.target.closest('.scatter-photo')) {
                    clearMobileStoryPhotoState();
                }
            }, { passive: true });
        } else {
            document.addEventListener('touchstart', (event) => {
                if (!event.target.closest('.scatter-photo')) {
                    clearMobileStoryPhotoState();
                }
            }, { passive: true });
        }

        window.addEventListener('scroll', () => {
            if (activeStoryPress) {
                releaseMobileStoryPhoto(activeStoryPress);
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            const isDesktopNow = isDesktopStoryViewport();
            if (isDesktopNow === wasDesktopStoryViewport) {
                return;
            }

            wasDesktopStoryViewport = isDesktopNow;
            stopStoryDrag();
            syncStoryLayoutForViewport();
            setStoryEditorExport(buildStoryLayoutCss(storyLayouts));
        }, { passive: true });
    }

    if (reduceMotion) {
        animatedElements.forEach((element) => {
            element.classList.add('is-visible');
        });
    }
});
