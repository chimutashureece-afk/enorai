class QualityScorer:

    def score(self, response):

        score = 0.5

        if "hallucination" not in response.lower():
            score += 0.3

        if len(response) > 80:
            score += 0.2

        return round(score, 2)