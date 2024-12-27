class ColorMasterApp {
    constructor() {
        this.currentColor = {
            h: 180,
            s: 50,
            l: 50
        };
        this.init();
    }

    init() {
        this.initElements();
        this.initSliders();
        this.bindEvents();
        this.loadSavedColors();
        this.loadTheme();
        this.updateUI();
    }

    initElements() {
        this.elements = {
            preview: document.getElementById('colorPreview'),
            formats: document.getElementById('colorFormats'),
            harmonies: document.getElementById('harmonies'),
            savedColors: document.getElementById('savedColors'),
            exportPreview: document.getElementById('exportPreview'),
            themeToggle: document.getElementById('themeToggle'),
            sliders: {
                hue: document.getElementById('hueSlider'),
                saturation: document.getElementById('saturationSlider'),
                lightness: document.getElementById('lightnessSlider')
            },
            values: {
                hue: document.getElementById('hueValue'),
                saturation: document.getElementById('saturationValue'),
                lightness: document.getElementById('lightnessValue')
            }
        };

        this.elements.formats.style.whiteSpace = 'pre';
        this.elements.exportPreview.style.whiteSpace = 'pre';
    }

    initSliders() {
        const { h, s, l } = this.currentColor;
        this.elements.sliders.hue.value = h;
        this.elements.sliders.saturation.value = s;
        this.elements.sliders.lightness.value = l;
    }

    bindEvents() {
        Object.entries(this.elements.sliders).forEach(([type, slider]) => {
            slider.addEventListener('input', () => this.handleSliderChange(type));
        });

        document.getElementById('saveColor').addEventListener('click', () => this.saveColor());
        document.getElementById('randomColor').addEventListener('click', () => this.generateRandomColor());
        document.getElementById('exportCSS').addEventListener('click', () => this.exportColor('css'));
        document.getElementById('exportSCSS').addEventListener('click', () => this.exportColor('scss'));
        document.getElementById('exportJSON').addEventListener('click', () => this.exportColor('json'));
        this.elements.themeToggle.addEventListener('change', (e) => this.toggleTheme(e.target.checked));
    }

    handleSliderChange(type) {
        const value = parseInt(this.elements.sliders[type].value);
        this.currentColor[type.charAt(0)] = value;
        this.updateUI();
    }

    updateUI() {
        const { h, s, l } = this.currentColor;
        const rgb = ColorConverter.HSLToRGB(h, s, l);
        const hex = ColorConverter.RGBToHex(rgb.r, rgb.g, rgb.b);
        const cmyk = ColorConverter.RGBToCMYK(rgb.r, rgb.g, rgb.b);

        this.updateColorPreview(h, s, l);
        this.updateSliderValues(h, s, l);
        this.updateColorFormats(hex, rgb, h, s, l, cmyk);
        this.updateHarmonies();
    }

    updateColorPreview(h, s, l) {
        this.elements.preview.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;
    }

    updateSliderValues(h, s, l) {
        this.elements.values.hue.textContent = `${h}°`;
        this.elements.values.saturation.textContent = `${s}%`;
        this.elements.values.lightness.textContent = `${l}%`;
    }

    updateColorFormats(hex, rgb, h, s, l, cmyk) {
        this.elements.formats.textContent = 
`HEX: ${hex}

RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})

HSL: hsl(${h}, ${s}%, ${l}%)

CMYK: cmyk(${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k})`;
    }

    updateHarmonies() {
        const harmonies = ColorConverter.getHarmonies(
            this.currentColor.h,
            this.currentColor.s,
            this.currentColor.l
        );

        this.elements.harmonies.innerHTML = Object.entries(harmonies)
            .map(([name, colors]) => `
                <div class="harmony-group">
                    <h4>${this.capitalizeFirst(name)}</h4>
                    <div class="harmony-preview">
                        ${colors.map(color => `
                            <div style="background: hsl(${color.h}, ${color.s}%, ${color.l}%)"></div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
    }

    saveColor() {
        const { h, s, l } = this.currentColor;
        const rgb = ColorConverter.HSLToRGB(h, s, l);
        const hex = ColorConverter.RGBToHex(rgb.r, rgb.g, rgb.b);
        
        if (!this.colorExists(hex)) {
            const swatch = this.createSwatch(hex);
            this.elements.savedColors.appendChild(swatch);
            
            const savedColors = this.getSavedColors();
            savedColors.push(hex);
            localStorage.setItem('savedColors', JSON.stringify(savedColors));
        }
    }

    createSwatch(hex) {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = hex;
        swatch.setAttribute('data-color', hex);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-swatch';
        deleteBtn.innerHTML = '×';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteColor(hex);
            swatch.remove();
        });
        
        swatch.appendChild(deleteBtn);
        swatch.addEventListener('click', () => this.loadColor(hex));
        
        return swatch;
    }

    deleteColor(hexToDelete) {
        const savedColors = this.getSavedColors().filter(hex => hex !== hexToDelete);
        localStorage.setItem('savedColors', JSON.stringify(savedColors));
    }

    loadColor(hex) {
        const hsl = ColorConverter.hexToHSL(hex);
        this.currentColor = hsl;
        this.initSliders();
        this.updateUI();
    }

    generateRandomColor() {
        this.currentColor = ColorConverter.generateRandomColor();
        this.initSliders();
        this.updateUI();
    }

    exportColor(format) {
        const { h, s, l } = this.currentColor;
        const rgb = ColorConverter.HSLToRGB(h, s, l);
        const hex = ColorConverter.RGBToHex(rgb.r, rgb.g, rgb.b);
        
        const exports = {
            css: this.generateCSS(hex, rgb, h, s, l),
            scss: this.generateSCSS(hex, rgb, h, s, l),
            json: this.generateJSON(hex, rgb, h, s, l)
        };

        this.elements.exportPreview.textContent = exports[format];
    }

    generateCSS(hex, rgb, h, s, l) {
        return `/* Color Master Studio - Generated CSS Variables */

:root {
    --color-primary: ${hex};
    --color-primary-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};
    --color-primary-hsl: ${h}, ${s}%, ${l}%;
    --color-primary-alpha: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5);
}

/* Usage Examples */
.element {
    color: var(--color-primary);
    background-color: var(--color-primary-alpha);
    border-color: var(--color-primary);
}`;
    }

    generateSCSS(hex, rgb, h, s, l) {
        return `// Color Master Studio - Generated SCSS Variables

$color-primary: ${hex};

$color-primary-rgb: (
    r: ${rgb.r},
    g: ${rgb.g},
    b: ${rgb.b}
);

$color-primary-hsl: (
    h: ${h},
    s: ${s}%,
    l: ${l}%
);

// RGB Helper Function
@function rgb-color($alpha: 1) {
    @return rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, $alpha);
}

// Usage Examples
.element {
    color: $color-primary;
    background-color: rgb-color(0.5);
    border: 1px solid rgb-color(0.8);
}`;
    }

    generateJSON(hex, rgb, h, s, l) {
        const data = {
            colorMasterStudio: {
                version: "1.0",
                generated: new Date().toISOString(),
                color: {
                    hex: hex,
                    rgb: {
                        value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                        channels: {
                            r: rgb.r,
                            g: rgb.g,
                            b: rgb.b
                        }
                    },
                    hsl: {
                        value: `hsl(${h}, ${s}%, ${l}%)`,
                        channels: {
                            h: h,
                            s: s,
                            l: l
                        }
                    }
                }
            }
        };
        return JSON.stringify(data, null, 2);
    }

    toggleTheme(isDark) {
        const theme = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.elements.themeToggle.checked = savedTheme === 'dark';
    }

    getSavedColors() {
        return JSON.parse(localStorage.getItem('savedColors') || '[]');
    }

    loadSavedColors() {
        const savedColors = this.getSavedColors();
        savedColors.forEach(color => {
            const swatch = this.createSwatch(color);
            this.elements.savedColors.appendChild(swatch);
        });
    }

    colorExists(hex) {
        return this.getSavedColors().includes(hex);
    }

    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.colorMaster = new ColorMasterApp();
});
