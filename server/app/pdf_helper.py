from langchain.vectorstores import Chroma
from langchain import PromptTemplate

from config import Config
from app.models import embeddings

config = Config.get_config()


class PDFHelper:
    @staticmethod
    def build_vectorstore_with_embedding():
        print('Getting vectorstore')
        embedding_object = embeddings.get(config.embedding_id)['class']
        db_vectorstore_path = f"{config.VECTORSTORE_DB_PATH}/{config.document.name}"
        vectorstore = Chroma(persist_directory=db_vectorstore_path, embedding_function=embedding_object())
        return vectorstore

    @staticmethod
    def build_prompt_qa_template():
        template = """Use the following pieces of context to answer the question at the end.
        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        Respond with a max of 3 sentences.
        {context}
        Question: {question}
        Helpful Answer:"""
        QA_CHAIN_PROMPT = PromptTemplate(
            input_variables=["context", "question"],
            template=template,
        )
        return QA_CHAIN_PROMPT
