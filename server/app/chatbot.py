from uuid import uuid4
from langchain.llms.ollama import Ollama
from langchain.chains.retrieval_qa.base import BaseRetrievalQA, RetrievalQA
from config import Config
from app.helper import create_bot_message, get_users_list
from app.models import Message, loaders, embeddings
from langchain.embeddings import GPT4AllEmbeddings, OpenAIEmbeddings, OllamaEmbeddings
from langchain.document_loaders import UnstructuredPDFLoader, PyPDFLoader
from langchain.vectorstores.chroma import Chroma
from langchain.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.callbacks.manager import CallbackManager



config = Config.get_config()


class ChatBot:
    def __init__(self, id: str):
        self.id = id
        self.llm = Ollama(model=id, base_url="http://localhost:11434")
        self.user = config.users.get(id)

    @staticmethod
    def _get_documents_from_global_config() -> list:
        '''
        Returns the list of document(s) from the config
        '''
        local_uri = config.document.local_uri
        print("local_uri", local_uri)
        loader = loaders.get(config.loader)['config']
        pdf_loader = loader(local_uri)
        documents = pdf_loader.load()
        return documents

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

    def _build_qa_chain_for_pdf(self) -> BaseRetrievalQA:
        vectorstore = self.build_vectorstore_with_embedding()
        qa_chain_prompt_template = self.build_prompt_qa_template()
        qa_chain = RetrievalQA.from_chain_type(
            self.llm,
            retriever=vectorstore.as_retriever(),
            chain_type_kwargs={"prompt": qa_chain_prompt_template},
            return_source_documents=False,
        )
        return qa_chain

    def build_vectorstore_with_embedding(self):
        print('Getting vectorstore')
        embedding_object = GPT4AllEmbeddings
        if config.embedding_id == 'openai':
            embedding_object = OpenAIEmbeddings # Token expired
        elif config.embedding_id == 'ollama':
            embedding_object = OllamaEmbeddings
        db_vectorstore_path = f"{config.VECTORSTORE_DB_PATH}/{config.embedding_id}/{config.document.name}"
        documents = self._get_documents_from_global_config()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=100)
        all_splits = text_splitter.split_documents(documents)
        vectorstore = Chroma.from_documents(documents=all_splits, embedding=embedding_object(), persist_directory=db_vectorstore_path)
        # vectorstore = Chroma.from_documents(persist_directory=db_vectorstore_path, embedding_function=embedding_object())
        return vectorstore
    def ask_question(self, prompt: str):
        reply = self.llm(prompt)
        return create_bot_message(user_id=self.id, text=reply)

    def ask_bot_about_pdf(self, message: Message):
        id = str(uuid4())
        chain = self._build_qa_chain_for_pdf()
        response = chain({"query": message.prompt})
        return {"_id": id, "text": response.get("result"), "user": self.user}
