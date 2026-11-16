import math
import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class FeedRecommenderEngine:
    def __init__(self, time_decay_gravity: float = 1.8):
        self.gravity = time_decay_gravity

    def calculate_time_decay_score(self, reactions: int, comments: int, shares: int, created_at_iso: str) -> float:
        """
        Computes gravity-based time decay engagement score.
        Formula: Engagement / (AgeInHours + 2)^gravity
        """
        try:
            post_time = datetime.fromisoformat(created_at_iso.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            age_hours = max(0.0, (now - post_time).total_seconds() / 3600.0)
        except Exception:
            age_hours = 1.0

        raw_engagement = (reactions * 2.0) + (comments * 3.5) + (shares * 5.0) + 1.0
        score = raw_engagement / math.pow(age_hours + 2.0, self.gravity)
        return float(round(score, 4))

    def compute_text_similarity(self, user_interests: List[str], post_texts: List[str]) -> np.ndarray:
        """
        Calculates cosine similarity between user interest profile and post contents using TF-IDF.
        """
        if not user_interests or not post_texts:
            return np.zeros(len(post_texts))

        user_query = " ".join(user_interests).strip()
        if not user_query:
            return np.zeros(len(post_texts))

        corpus = [user_query] + post_texts
        try:
            vectorizer = TfidfVectorizer(stop_words="english", max_features=500)
            tfidf_matrix = vectorizer.fit_transform(corpus)
            user_vec = tfidf_matrix[0:1]
            post_vecs = tfidf_matrix[1:]
            similarities = cosine_similarity(user_vec, post_vecs).flatten()
            return np.clip(similarities, 0.0, 1.0)
        except Exception:
            # Fallback if vocabulary is empty or only stop words
            return np.zeros(len(post_texts))

    def rank_feed(
        self,
        posts: List[Dict[str, Any]],
        user_id: str,
        user_interests: List[str],
        friend_ids: List[str],
        interaction_weights: Optional[Dict[str, float]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Ranks posts dynamically based on:
        - Affinity (Friendship & prior interactions)
        - Content similarity (TF-IDF vector matching)
        - Engagement time decay
        """
        if not posts:
            return []

        friend_set = set(friend_ids)
        weights = interaction_weights or {}

        texts = [f"{p.get('caption', '')} {' '.join(p.get('tags', []))}" for p in posts]
        similarity_scores = self.compute_text_similarity(user_interests, texts)

        ranked = []
        for idx, post in enumerate(posts):
            author_id = post.get("authorId", "")
            
            # Affinity component (0.0 to 1.0)
            is_friend = author_id in friend_set
            custom_weight = weights.get(author_id, 0.0)
            affinity = 0.8 if is_friend else 0.2
            affinity = min(1.0, affinity + custom_weight)

            # Content component
            content_sim = float(similarity_scores[idx])

            # Engagement time-decay component
            decay_score = self.calculate_time_decay_score(
                reactions=post.get("reactionsCount", 0),
                comments=post.get("commentsCount", 0),
                shares=post.get("sharesCount", 0),
                created_at_iso=post.get("createdAt", datetime.now(timezone.utc).isoformat()),
            )

            # Combined weighted score
            # 40% affinity, 35% time-decay engagement, 25% content similarity
            final_score = (affinity * 40.0) + (min(decay_score, 100.0) * 0.35) + (content_sim * 25.0)

            ranked.append({
                **post,
                "_recommendation": {
                    "finalScore": round(final_score, 4),
                    "affinityScore": round(affinity, 4),
                    "contentSimilarity": round(content_sim, 4),
                    "timeDecayScore": round(decay_score, 4),
                }
            })

        # Sort descending by finalScore
        ranked.sort(key=lambda x: x["_recommendation"]["finalScore"], reverse=True)
        return ranked
