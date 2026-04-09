from app.knowledge.knowledge_base import documents


class Retriever:

    def __init__(self):
        self.docs = documents

    def retrieve(self, query):
        query_terms = {term.strip(".,!?").lower() for term in query.split() if term.strip()}

        best_doc = self.docs[0]
        best_score = -1

        for doc in self.docs:
            doc_terms = {term.strip(".,!?").lower() for term in doc.split() if term.strip()}
            score = len(query_terms.intersection(doc_terms))

            if score > best_score:
                best_score = score
                best_doc = doc

        return best_doc
