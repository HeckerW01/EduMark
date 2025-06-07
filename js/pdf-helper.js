/**
 * PDF.js helper utility
 * 
 * This file provides helper functions to load and display PDFs using PDF.js
 * In a real production app, you would include the full PDF.js library
 * For this demo, we'll simulate PDF interaction
 */

// Simple PDF viewer class
class PDFViewer {
    /**
     * Initialize a PDF viewer
     * @param {string} containerId - The ID of the container element
     * @param {boolean} editable - Whether the PDF should be editable
     */
    constructor(containerId, editable = false) {
        this.container = document.getElementById(containerId);
        this.editable = editable;
        this.currentPage = 1;
        this.pdfDocument = null;
        this.totalPages = 0;
        this.annotations = [];
        
        // Create viewer elements
        this.createViewerElements();
    }
    
    /**
     * Create the necessary elements for the PDF viewer
     */
    createViewerElements() {
        // Clear container
        this.container.innerHTML = '';
        
        // Create toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'pdf-toolbar';
        toolbar.innerHTML = `
            <div class="page-controls">
                <button class="prev-page">Previous</button>
                <span class="page-info">Page <span class="current-page">1</span> of <span class="total-pages">1</span></span>
                <button class="next-page">Next</button>
            </div>
            <div class="zoom-controls">
                <button class="zoom-in">+</button>
                <button class="zoom-out">-</button>
            </div>
        `;
        this.container.appendChild(toolbar);
        
        // Create canvas container
        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'canvas-container';
        this.canvas = document.createElement('canvas');
        canvasContainer.appendChild(this.canvas);
        this.container.appendChild(canvasContainer);
        
        // Add event listeners
        toolbar.querySelector('.prev-page').addEventListener('click', () => this.prevPage());
        toolbar.querySelector('.next-page').addEventListener('click', () => this.nextPage());
        toolbar.querySelector('.zoom-in').addEventListener('click', () => this.zoomIn());
        toolbar.querySelector('.zoom-out').addEventListener('click', () => this.zoomOut());
        
        // If editable, create annotation layer
        if (this.editable) {
            this.createAnnotationLayer(canvasContainer);
        }
    }
    
    /**
     * Create the annotation layer for drawing
     */
    createAnnotationLayer(canvasContainer) {
        // Create annotation canvas that overlays the PDF canvas
        this.annotationCanvas = document.createElement('canvas');
        this.annotationCanvas.className = 'annotation-layer';
        canvasContainer.appendChild(this.annotationCanvas);
        
        // Set up the canvas context for drawing
        this.annotationCtx = this.annotationCanvas.getContext('2d');
        
        // Set default tool properties
        this.currentTool = 'pen';
        this.currentColor = '#000000';
        this.currentWidth = 2;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.textInput = null;
        
        // Add event listeners for drawing
        this.annotationCanvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.annotationCanvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.annotationCanvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.annotationCanvas.addEventListener('mouseout', this.handleMouseOut.bind(this));
        this.annotationCanvas.addEventListener('click', this.handleClick.bind(this));
    }
    
    /**
     * Handle mouse down event
     */
    handleMouseDown(e) {
        const rect = this.annotationCanvas.getBoundingClientRect();
        this.isDrawing = true;
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        
        // For eraser, immediately start erasing
        if (this.currentTool === 'eraser') {
            this.erase(this.lastX, this.lastY);
        }
    }
    
    /**
     * Handle mouse move event
     */
    handleMouseMove(e) {
        if (!this.isDrawing) return;
        
        const rect = this.annotationCanvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        switch (this.currentTool) {
            case 'pen':
                this.drawLine(this.lastX, this.lastY, currentX, currentY);
                break;
            case 'highlighter':
                this.drawHighlight(this.lastX, this.lastY, currentX, currentY);
                break;
            case 'eraser':
                this.erase(currentX, currentY);
                break;
        }
        
        this.lastX = currentX;
        this.lastY = currentY;
    }
    
    /**
     * Handle mouse up event
     */
    handleMouseUp() {
        this.isDrawing = false;
    }
    
    /**
     * Handle mouse out event
     */
    handleMouseOut() {
        this.isDrawing = false;
    }
    
    /**
     * Handle click event for text tool
     */
    handleClick(e) {
        if (this.currentTool !== 'text') return;
        
        // Remove any existing text input
        this.removeTextInput();
        
        const rect = this.annotationCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create text input at click position
        this.createTextInput(x, y);
    }
    
    /**
     * Create text input at specified position
     */
    createTextInput(x, y) {
        const textInput = document.createElement('textarea');
        textInput.className = 'pdf-text-input';
        textInput.style.position = 'absolute';
        textInput.style.left = `${x}px`;
        textInput.style.top = `${y}px`;
        textInput.style.minWidth = '100px';
        textInput.style.minHeight = '24px';
        textInput.style.padding = '2px';
        textInput.style.border = '1px solid #000';
        textInput.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        textInput.style.zIndex = '100';
        textInput.style.resize = 'both';
        textInput.style.overflow = 'hidden';
        
        textInput.addEventListener('blur', () => {
            const text = textInput.value.trim();
            if (text) {
                this.addTextAnnotation(x, y, text);
            }
            this.removeTextInput();
        });
        
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                textInput.blur();
            }
        });
        
        this.annotationCanvas.parentNode.appendChild(textInput);
        this.textInput = textInput;
        
        // Focus the text input
        setTimeout(() => textInput.focus(), 10);
    }
    
    /**
     * Remove text input
     */
    removeTextInput() {
        if (this.textInput && this.textInput.parentNode) {
            this.textInput.parentNode.removeChild(this.textInput);
            this.textInput = null;
        }
    }
    
    /**
     * Add text annotation
     */
    addTextAnnotation(x, y, text) {
        // Draw text on the annotation canvas
        this.annotationCtx.font = `${this.currentWidth * 5}px sans-serif`;
        this.annotationCtx.fillStyle = this.currentColor;
        this.annotationCtx.fillText(text, x, y + this.currentWidth * 5);
        
        // Save text annotation
        this.annotations.push({
            type: 'text',
            page: this.currentPage,
            x: x,
            y: y,
            text: text,
            color: this.currentColor,
            size: this.currentWidth * 5
        });
    }
    
    /**
     * Draw line
     */
    drawLine(startX, startY, endX, endY) {
        this.annotationCtx.beginPath();
        this.annotationCtx.moveTo(startX, startY);
        this.annotationCtx.lineTo(endX, endY);
        this.annotationCtx.strokeStyle = this.currentColor;
        this.annotationCtx.lineWidth = this.currentWidth;
        this.annotationCtx.lineCap = 'round';
        this.annotationCtx.lineJoin = 'round';
        this.annotationCtx.globalAlpha = 1;
        this.annotationCtx.stroke();
        
        // Save annotation
        this.annotations.push({
            type: 'line',
            page: this.currentPage,
            start: { x: startX, y: startY },
            end: { x: endX, y: endY },
            color: this.currentColor,
            width: this.currentWidth
        });
    }
    
    /**
     * Draw highlight
     */
    drawHighlight(startX, startY, endX, endY) {
        this.annotationCtx.beginPath();
        this.annotationCtx.moveTo(startX, startY);
        this.annotationCtx.lineTo(endX, endY);
        this.annotationCtx.strokeStyle = this.currentColor;
        this.annotationCtx.lineWidth = this.currentWidth * 3;
        this.annotationCtx.lineCap = 'round';
        this.annotationCtx.lineJoin = 'round';
        this.annotationCtx.globalAlpha = 0.4;
        this.annotationCtx.stroke();
        
        // Save annotation
        this.annotations.push({
            type: 'highlight',
            page: this.currentPage,
            start: { x: startX, y: startY },
            end: { x: endX, y: endY },
            color: this.currentColor,
            width: this.currentWidth * 3
        });
    }
    
    /**
     * Erase at point
     */
    erase(x, y) {
        // Use a large circle to erase
        const radius = this.currentWidth * 5;
        
        // Find and remove annotations under the eraser
        this.annotations = this.annotations.filter(anno => {
            if (anno.page !== this.currentPage) return true;
            
            // For lines and highlights, check if any part is under the eraser
            if (anno.type === 'line' || anno.type === 'highlight') {
                return !this.isPointNearLine(x, y, anno.start.x, anno.start.y, anno.end.x, anno.end.y, radius);
            }
            
            // For text, check if the starting point is under the eraser
            if (anno.type === 'text') {
                const distance = Math.sqrt((x - anno.x) ** 2 + (y - anno.y) ** 2);
                return distance > radius;
            }
            
            return true;
        });
        
        // Redraw all annotations
        this.clearAnnotations();
        this.drawSavedAnnotations();
    }
    
    /**
     * Check if point is near line
     */
    isPointNearLine(px, py, x1, y1, x2, y2, threshold) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return false;
        
        // Calculate distance from point to line
        const t = ((px - x1) * dx + (py - y1) * dy) / (length * length);
        
        if (t < 0) {
            // Point is beyond the start of the line
            const distance = Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
            return distance < threshold;
        } else if (t > 1) {
            // Point is beyond the end of the line
            const distance = Math.sqrt((px - x2) ** 2 + (py - y2) ** 2);
            return distance < threshold;
        } else {
            // Point is within the line segment
            const projX = x1 + t * dx;
            const projY = y1 + t * dy;
            const distance = Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
            return distance < threshold;
        }
    }
    
    /**
     * Load a PDF from URL
     * @param {string} url - The URL of the PDF to load
     */
    loadPDF(url) {
        // In a real implementation, this would use the PDF.js library
        // For this demo, we'll simulate loading a PDF
        
        // Simulate loading delay
        this.showLoadingMessage();
        
        setTimeout(() => {
            // Mock PDF document
            this.pdfDocument = {
                numPages: 5,
                getPage: (pageNumber) => {
                    return {
                        getViewport: () => ({ width: 800, height: 1100 }),
                        render: (renderContext) => {
                            // Simulate rendering by drawing a placeholder
                            const ctx = renderContext.canvasContext;
                            const canvas = ctx.canvas;
                            const width = canvas.width;
                            const height = canvas.height;
                            
                            // Clear canvas
                            ctx.fillStyle = 'white';
                            ctx.fillRect(0, 0, width, height);
                            
                            // Draw page border
                            ctx.strokeStyle = '#ddd';
                            ctx.lineWidth = 1;
                            ctx.strokeRect(10, 10, width - 20, height - 20);
                            
                            // Draw page number
                            ctx.font = '24px sans-serif';
                            ctx.fillStyle = 'black';
                            ctx.textAlign = 'center';
                            ctx.fillText(`Page ${pageNumber} of PDF Document`, width / 2, 50);
                            
                            // Draw placeholder content
                            ctx.font = '16px sans-serif';
                            ctx.fillText(`This is a placeholder for PDF content`, width / 2, 100);
                            ctx.fillText(`In a real implementation, actual PDF content would be rendered here`, width / 2, 130);
                            
                            // Simulate completion
                            setTimeout(() => {
                                if (renderContext.complete) {
                                    renderContext.complete();
                                }
                            }, 100);
                            
                            return {
                                promise: Promise.resolve()
                            };
                        }
                    };
                }
            };
            
            this.totalPages = this.pdfDocument.numPages;
            this.updatePageInfo();
            
            // Render first page
            this.renderPage(1);
            
        }, 1000);
    }
    
    /**
     * Show loading message
     */
    showLoadingMessage() {
        const ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.font = '24px sans-serif';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('Loading PDF...', this.canvas.width / 2, this.canvas.height / 2);
    }
    
    /**
     * Render a specific page
     * @param {number} pageNumber - The page number to render
     */
    renderPage(pageNumber) {
        if (!this.pdfDocument) return;
        
        this.currentPage = pageNumber;
        this.updatePageInfo();
        
        // Get the page
        const pdfPage = this.pdfDocument.getPage(pageNumber);
        
        // Get viewport
        const viewport = pdfPage.getViewport();
        
        // Set canvas size
        this.canvas.width = viewport.width;
        this.canvas.height = viewport.height;
        
        // If we have an annotation canvas, set its size too
        if (this.annotationCanvas) {
            this.annotationCanvas.width = viewport.width;
            this.annotationCanvas.height = viewport.height;
            this.clearAnnotations();
            this.drawSavedAnnotations();
        }
        
        // Render the page
        const renderContext = {
            canvasContext: this.canvas.getContext('2d'),
            viewport: viewport
        };
        
        pdfPage.render(renderContext);
    }
    
    /**
     * Update page info in the toolbar
     */
    updatePageInfo() {
        const currentPageEl = this.container.querySelector('.current-page');
        const totalPagesEl = this.container.querySelector('.total-pages');
        
        if (currentPageEl) currentPageEl.textContent = this.currentPage;
        if (totalPagesEl) totalPagesEl.textContent = this.totalPages;
    }
    
    /**
     * Navigate to the previous page
     */
    prevPage() {
        if (this.currentPage > 1) {
            this.renderPage(this.currentPage - 1);
        }
    }
    
    /**
     * Navigate to the next page
     */
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.renderPage(this.currentPage + 1);
        }
    }
    
    /**
     * Zoom in
     */
    zoomIn() {
        // Implementation would depend on PDF.js
        console.log('Zoom in functionality would be implemented with PDF.js');
    }
    
    /**
     * Zoom out
     */
    zoomOut() {
        // Implementation would depend on PDF.js
        console.log('Zoom out functionality would be implemented with PDF.js');
    }
    
    /**
     * Clear annotations on the current page
     */
    clearAnnotations() {
        if (this.annotationCtx) {
            this.annotationCtx.clearRect(0, 0, this.annotationCanvas.width, this.annotationCanvas.height);
        }
    }
    
    /**
     * Draw saved annotations for the current page
     */
    drawSavedAnnotations() {
        if (!this.annotationCtx) return;
        
        const pageAnnotations = this.annotations.filter(anno => anno.page === this.currentPage);
        
        pageAnnotations.forEach(anno => {
            if (anno.type === 'line') {
                this.annotationCtx.beginPath();
                this.annotationCtx.moveTo(anno.start.x, anno.start.y);
                this.annotationCtx.lineTo(anno.end.x, anno.end.y);
                this.annotationCtx.strokeStyle = anno.color;
                this.annotationCtx.lineWidth = anno.width;
                this.annotationCtx.lineCap = 'round';
                this.annotationCtx.lineJoin = 'round';
                this.annotationCtx.globalAlpha = 1;
                this.annotationCtx.stroke();
            } else if (anno.type === 'highlight') {
                this.annotationCtx.beginPath();
                this.annotationCtx.moveTo(anno.start.x, anno.start.y);
                this.annotationCtx.lineTo(anno.end.x, anno.end.y);
                this.annotationCtx.strokeStyle = anno.color;
                this.annotationCtx.lineWidth = anno.width;
                this.annotationCtx.lineCap = 'round';
                this.annotationCtx.lineJoin = 'round';
                this.annotationCtx.globalAlpha = 0.4;
                this.annotationCtx.stroke();
            } else if (anno.type === 'text') {
                this.annotationCtx.font = `${anno.size}px sans-serif`;
                this.annotationCtx.fillStyle = anno.color;
                this.annotationCtx.globalAlpha = 1;
                this.annotationCtx.fillText(anno.text, anno.x, anno.y + anno.size);
            }
        });
        
        // Reset global alpha
        this.annotationCtx.globalAlpha = 1;
    }
    
    /**
     * Set the current drawing tool
     * @param {string} tool - The tool type ('pen', 'highlighter', 'eraser', 'text')
     * @param {string} color - The color to use
     * @param {number} width - The line width to use
     */
    setTool(tool, color, width) {
        if (!this.annotationCtx) return;
        
        this.currentTool = tool;
        this.currentColor = color || '#000000';
        this.currentWidth = width || 2;
        
        // Remove any active text input when changing tools
        if (tool !== 'text') {
            this.removeTextInput();
        }
    }
    
    /**
     * Get all annotations
     * @returns {Array} The annotations array
     */
    getAnnotations() {
        return this.annotations;
    }
    
    /**
     * Set annotations
     * @param {Array} annotations - The annotations to set
     */
    setAnnotations(annotations) {
        this.annotations = annotations || [];
        this.clearAnnotations();
        this.drawSavedAnnotations();
    }
} 