from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.knowledge.knowledge_base import documents


class Retriever:

    def __init__(self):

        self.docs = documents
        self.vectorizer = TfidfVectorizer()
        self.vectors = self.vectorizer.fit_transform(self.docs)

    def retrieve(self, query):

        query_vec = self.vectorizer.transform([query])
        similarity = cosine_similarity(query_vec, self.vectors)
        index = similarity.argmax()

        return self.docs[index]