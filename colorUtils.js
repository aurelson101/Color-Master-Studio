class ColorConverter {
    static HSLToRGB(h, s, l) {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        
        return {
            r: Math.round(255 * f(0)),
            g: Math.round(255 * f(8)),
            b: Math.round(255 * f(4))
        };
    }

    static RGBToHex(r, g, b) {
        const toHex = x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }

    static hexToRGB(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    static hexToHSL(hex) {
        const { r, g, b } = this.hexToRGB(hex);
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;

        const max = Math.max(rNorm, gNorm, bNorm);
        const min = Math.min(rNorm, gNorm, bNorm);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case rNorm:
                    h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
                    break;
                case gNorm:
                    h = (bNorm - rNorm) / d + 2;
                    break;
                case bNorm:
                    h = (rNorm - gNorm) / d + 4;
                    break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    static RGBToCMYK(r, g, b) {
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;

        const k = 1 - Math.max(rNorm, gNorm, bNorm);
        const c = (1 - rNorm - k) / (1 - k) || 0;
        const m = (1 - gNorm - k) / (1 - k) || 0;
        const y = (1 - bNorm - k) / (1 - k) || 0;

        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100)
        };
    }

    static getHarmonies(h, s, l) {
        return {
            complementary: [
                { h, s, l },
                { h: (h + 180) % 360, s, l }
            ],
            triadic: [
                { h, s, l },
                { h: (h + 120) % 360, s, l },
                { h: (h + 240) % 360, s, l }
            ],
            splitComplementary: [
                { h, s, l },
                { h: (h + 150) % 360, s, l },
                { h: (h + 210) % 360, s, l }
            ],
            analogous: [
                { h: (h - 30 + 360) % 360, s, l },
                { h, s, l },
                { h: (h + 30) % 360, s, l }
            ],
            tetradic: [
                { h, s, l },
                { h: (h + 90) % 360, s, l },
                { h: (h + 180) % 360, s, l },
                { h: (h + 270) % 360, s, l }
            ],
            monochromatic: [
                { h, s, l: Math.max(0, l - 30) },
                { h, s, l: Math.max(0, l - 15) },
                { h, s, l },
                { h, s, l: Math.min(100, l + 15) },
                { h, s, l: Math.min(100, l + 30) }
            ]
        };
    }

    static isValidHex(hex) {
        return /^#[0-9A-F]{6}$/i.test(hex);
    }

    static generateRandomColor() {
        return {
            h: Math.floor(Math.random() * 360),
            s: Math.floor(Math.random() * 41) + 60, // 60-100 for vibrant colors
            l: Math.floor(Math.random() * 41) + 30  // 30-70 for visible colors
        };
    }

    static getContrastColor(hex) {
        const rgb = this.hexToRGB(hex);
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
}
