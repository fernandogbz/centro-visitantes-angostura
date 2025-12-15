from PIL import Image
import os

# Configuración
input_file = "fox-sprite.png"
output_dir = "fox_frames"

# Crear carpeta de salida
os.makedirs(output_dir, exist_ok=True)

# Cargar la imagen
img = Image.open(input_file)
width, height = img.size

# Calcular el tamaño de cada frame
frame_width = width // 5  # 5 columnas
frame_height = height // 2  # 2 filas

print(f"Imagen original: {width}x{height}px")
print(f"Cada frame será: {frame_width}x{frame_height}px")

# Extraer frames de la fila superior (idle/wave)
for i in range(5):
    x = i * frame_width
    y = 0
    frame = img.crop((x, y, x + frame_width, y + frame_height))
    frame.save(f"{output_dir}/fox-idle-{i+1}.png")
    print(f"✓ Guardado: fox-idle-{i+1}.png")

# Extraer frames de la fila inferior (walk)
for i in range(5):
    x = i * frame_width
    y = frame_height
    frame = img.crop((x, y, x + frame_width, y + frame_height))
    frame.save(f"{output_dir}/fox-walk-{i+1}.png")
    print(f"✓ Guardado: fox-walk-{i+1}.png")

print(f"\n✅ ¡Listo! 10 frames guardados en la carpeta '{output_dir}'")