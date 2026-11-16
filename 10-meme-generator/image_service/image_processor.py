import io
import base64
from typing import Optional, Tuple, List, Dict, Any
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np


class MemeImageProcessor:
    @staticmethod
    def create_blank_canvas(width: int = 800, height: int = 600, color: str = "#ffffff") -> Image.Image:
        """Creates a clean RGB canvas."""
        return Image.new("RGBA", (width, height), color)

    @staticmethod
    def apply_filter(image: Image.Image, filter_name: str) -> Image.Image:
        """
        Applies visual filters: grayscale, sepia, invert, blur, sharpen, vintage.
        """
        img = image.convert("RGBA")
        rgb_img = img.convert("RGB")

        if filter_name == "grayscale":
            gray = rgb_img.convert("L").convert("RGBA")
            return gray

        elif filter_name == "sepia":
            # Sepia matrix transformation
            np_img = np.array(rgb_img, dtype=float)
            sepia_matrix = np.array([
                [0.393, 0.769, 0.189],
                [0.349, 0.686, 0.168],
                [0.272, 0.534, 0.131]
            ])
            sepia_img = np.dot(np_img, sepia_matrix.T)
            sepia_img = np.clip(sepia_img, 0, 255).astype(np.uint8)
            return Image.fromarray(sepia_img).convert("RGBA")

        elif filter_name == "invert":
            np_img = np.array(rgb_img, dtype=np.uint8)
            inverted = 255 - np_img
            return Image.fromarray(inverted).convert("RGBA")

        elif filter_name == "blur":
            return img.filter(ImageFilter.GaussianBlur(radius=3))

        elif filter_name == "sharpen":
            return img.filter(ImageFilter.SHARPEN)

        elif filter_name == "high_contrast":
            enhancer = ImageEnhance.Contrast(rgb_img)
            return enhancer.enhance(1.8).convert("RGBA")

        return img

    @staticmethod
    def render_meme(
        base_image: Optional[Image.Image] = None,
        width: int = 800,
        height: int = 600,
        top_text: str = "",
        bottom_text: str = "",
        font_size: int = 42,
        text_color: str = "#ffffff",
        stroke_color: str = "#000000",
        stroke_width: int = 3,
        watermark: str = "Linkup Memes",
        filter_name: Optional[str] = None,
    ) -> Image.Image:
        """
        Composites top text, bottom text with stroke outline, and watermark over base image.
        """
        canvas = base_image.convert("RGBA") if base_image else MemeImageProcessor.create_blank_canvas(width, height)
        canvas = canvas.resize((width, height), Image.Resampling.LANCZOS)

        if filter_name:
            canvas = MemeImageProcessor.apply_filter(canvas, filter_name)

        draw = ImageDraw.Draw(canvas)
        font = ImageFont.load_default()

        # Helper to draw centered text with thick stroke
        def draw_centered_text(text: str, y_pos: int):
            if not text:
                return
            bbox = draw.textbbox((0, 0), text, font=font)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]
            x_pos = (width - text_w) // 2
            
            # Stroke outline
            for dx in range(-stroke_width, stroke_width + 1):
                for dy in range(-stroke_width, stroke_width + 1):
                    if dx != 0 or dy != 0:
                        draw.text((x_pos + dx, y_pos + dy), text, font=font, fill=stroke_color)
            
            draw.text((x_pos, y_pos), text, font=font, fill=text_color)

        if top_text:
            draw_centered_text(top_text.upper(), 30)

        if bottom_text:
            draw_centered_text(bottom_text.upper(), height - 70)

        if watermark:
            draw.text((width - 120, height - 25), watermark, font=font, fill="#888888")

        return canvas

    @staticmethod
    def to_base64_png(image: Image.Image) -> str:
        """Converts PIL Image to base64 PNG string."""
        buf = io.BytesIO()
        image.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode("utf-8")
