import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from image_processor import MemeImageProcessor

app = FastAPI(
    title="Linkup Meme Image DSP Service",
    description="Python PIL / NumPy image processing and meme compositing engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RenderMemeRequest(BaseModel):
    width: int = Field(default=800, ge=100, le=2400)
    height: int = Field(default=600, ge=100, le=2400)
    topText: str = Field(default="")
    bottomText: str = Field(default="")
    textColor: str = Field(default="#ffffff")
    strokeColor: str = Field(default="#000000")
    strokeWidth: int = Field(default=3, ge=0, le=10)
    filterName: Optional[str] = Field(default=None)
    watermark: str = Field(default="Linkup Memes")


class RenderMemeResponse(BaseModel):
    format: str
    width: int
    height: int
    base64Png: str


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "meme-image-dsp-service",
        "framework": "FastAPI/Pillow/Python",
        "version": "1.0.0"
    }


@app.post("/api/v1/meme/render", response_model=RenderMemeResponse)
def render_meme_endpoint(req: RenderMemeRequest):
    try:
        img = MemeImageProcessor.render_meme(
            width=req.width,
            height=req.height,
            top_text=req.topText,
            bottom_text=req.bottomText,
            text_color=req.textColor,
            stroke_color=req.strokeColor,
            stroke_width=req.strokeWidth,
            watermark=req.watermark,
            filter_name=req.filterName,
        )
        b64 = MemeImageProcessor.to_base64_png(img)
        return RenderMemeResponse(
            format="PNG",
            width=req.width,
            height=req.height,
            base64Png=b64
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=False)
