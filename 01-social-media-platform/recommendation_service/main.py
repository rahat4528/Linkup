import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from recommender import FeedRecommenderEngine

app = FastAPI(
    title="Linkup Social Recommendation Engine",
    description="Python Scikit-Learn TF-IDF and time-decay recommendation microservice for Linkup feed ranking",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = FeedRecommenderEngine(time_decay_gravity=1.8)


class RankFeedRequest(BaseModel):
    userId: str
    userInterests: List[str] = Field(default_factory=list)
    friendIds: List[str] = Field(default_factory=list)
    interactionWeights: Dict[str, float] = Field(default_factory=dict)
    posts: List[Dict[str, Any]] = Field(default_factory=list)


class RankFeedResponse(BaseModel):
    userId: str
    totalRanked: int
    rankedPosts: List[Dict[str, Any]]


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "social-media-recommendation-engine",
        "framework": "FastAPI/Python",
        "version": "1.0.0"
    }


@app.post("/api/v1/recommendations/rank-feed", response_model=RankFeedResponse)
def rank_feed_endpoint(req: RankFeedRequest):
    try:
        ranked = engine.rank_feed(
            posts=req.posts,
            user_id=req.userId,
            user_interests=req.userInterests,
            friend_ids=req.friendIds,
            interaction_weights=req.interactionWeights,
        )
        return RankFeedResponse(
            userId=req.userId,
            totalRanked=len(ranked),
            rankedPosts=ranked,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)
