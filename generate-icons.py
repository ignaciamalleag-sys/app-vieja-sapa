from PIL import Image, ImageDraw

def create_icon(size, filename):
    img = Image.new('RGBA', (size, size), color=(6, 95, 70, 255)) # emerald-800
    draw = ImageDraw.Draw(img)
    
    # Outer ring
    margin = size // 10
    draw.ellipse([margin, margin, size - margin, size - margin], outline=(52, 211, 153, 255), width=size//30)
    
    # Inner eye shape
    eye_w = size * 0.6
    eye_h = size * 0.35
    cx, cy = size // 2, size // 2
    
    draw.ellipse([cx - eye_w//2, cy - eye_h//2, cx + eye_w//2, cy + eye_h//2], fill=(255, 255, 255, 255))
    draw.ellipse([cx - eye_h//2.5, cy - eye_h//2.5, cx + eye_h//2.5, cy + eye_h//2.5], fill=(5, 150, 105, 255))
    draw.ellipse([cx - eye_h//6, cy - eye_h//6, cx + eye_h//6, cy + eye_h//6], fill=(2, 44, 34, 255))

    img.save(filename, 'PNG')

try:
    create_icon(192, r'C:\Users\Casa\.gemini\antigravity\scratch\app-vieja-sapa\public\icon-192.png')
    create_icon(512, r'C:\Users\Casa\.gemini\antigravity\scratch\app-vieja-sapa\public\icon-512.png')
    print("Iconos PWA creados exitosamente")
except Exception as e:
    print(f"Error creando iconos: {e}")
