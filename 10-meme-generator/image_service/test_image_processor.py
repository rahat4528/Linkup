import pytest
from PIL import Image
from image_processor import MemeImageProcessor


def test_blank_canvas_creation():
    canvas = MemeImageProcessor.create_blank_canvas(400, 300, "#ff0000")
    assert canvas.size == (400, 300)
    assert canvas.mode == "RGBA"


def test_filter_application():
    base = MemeImageProcessor.create_blank_canvas(200, 200, "#336699")
    gray = MemeImageProcessor.apply_filter(base, "grayscale")
    assert gray.size == (200, 200)

    sepia = MemeImageProcessor.apply_filter(base, "sepia")
    assert sepia.size == (200, 200)

    blur = MemeImageProcessor.apply_filter(base, "blur")
    assert blur.size == (200, 200)


def test_render_meme_with_stroke_and_export():
    img = MemeImageProcessor.render_meme(
        width=500,
        height=400,
        top_text="WHEN THE CODE COMPILES",
        bottom_text="ON THE FIRST TRY",
        watermark="Test Watermark",
        filter_name="sepia"
    )
    assert img.size == (500, 400)
    b64 = MemeImageProcessor.to_base64_png(img)
    assert isinstance(b64, str)
    assert len(b64) > 100
