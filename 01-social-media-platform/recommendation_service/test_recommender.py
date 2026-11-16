import pytest
from datetime import datetime, timezone, timedelta
from recommender import FeedRecommenderEngine


def test_time_decay_recent_vs_old():
    engine = FeedRecommenderEngine(time_decay_gravity=1.8)
    now = datetime.now(timezone.utc)
    recent_iso = (now - timedelta(minutes=10)).isoformat()
    old_iso = (now - timedelta(days=5)).isoformat()

    recent_score = engine.calculate_time_decay_score(reactions=10, comments=5, shares=2, created_at_iso=recent_iso)
    old_score = engine.calculate_time_decay_score(reactions=10, comments=5, shares=2, created_at_iso=old_iso)

    assert recent_score > old_score
    assert recent_score > 0.0


def test_content_similarity_matching():
    engine = FeedRecommenderEngine()
    user_interests = ["artificial", "intelligence", "machine", "learning"]
    posts = [
        "Check out our new deep learning framework tutorial #ai #tech",
        "A great day for a picnic in the sunny park with coffee",
        "Exploring machine learning models and artificial intelligence research"
    ]

    scores = engine.compute_text_similarity(user_interests, posts)
    assert len(scores) == 3
    # First and third posts have matching keywords ("learning", "machine", "artificial", "intelligence")
    assert scores[0] > scores[1]
    assert scores[2] > scores[1]


def test_rank_feed_integration():
    engine = FeedRecommenderEngine()
    user_id = "user_alpha"
    friend_ids = ["user_friend"]
    user_interests = ["python", "coding"]

    posts = [
        {
            "id": "post_1",
            "authorId": "user_stranger",
            "caption": "Just having coffee",
            "tags": ["morning"],
            "reactionsCount": 2,
            "commentsCount": 0,
            "sharesCount": 0,
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "post_2",
            "authorId": "user_friend",
            "caption": "Building high-performance Python microservices with FastAPI and ML",
            "tags": ["python", "coding", "fastapi"],
            "reactionsCount": 25,
            "commentsCount": 12,
            "sharesCount": 4,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    ]

    ranked = engine.rank_feed(posts, user_id=user_id, user_interests=user_interests, friend_ids=friend_ids)
    assert len(ranked) == 2
    # Friend post with matching interests and high engagement must rank first
    assert ranked[0]["id"] == "post_2"
    assert ranked[0]["_recommendation"]["finalScore"] > ranked[1]["_recommendation"]["finalScore"]
