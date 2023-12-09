from uuid import uuid4
from langchain.llms import Ollama
from langchain.embeddings import GPT4AllEmbeddings, OpenAIEmbeddings
from langchain.document_loaders import UnstructuredPDFLoader
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain import PromptTemplate
from langchain.chains.retrieval_qa.base import BaseRetrievalQA
from langchain.document_loaders import PyPDFLoader

from config import config_dict
from app.models import Message
from app.helper import get_llm, users

config = config_dict.get('local')

embeddings = {
    'gpt-4': {
        'title': 'GPT4AllEmbeddings',
        'value': 'gpt-4',
        'class': GPT4AllEmbeddings
    },
    'openai': {
        'title': 'OpenAIEmbeddings',
        'value': 'openai',
        'class': OpenAIEmbeddings
    }
}

loaders = {
    'default': {
        'title': 'PyPDFLoader',
        'value': 'default',
        'config': PyPDFLoader
    },
    'unstruct': {
        'title': 'UnstructuredPDFLoader',
        'value': 'unstruct',
        'config': UnstructuredPDFLoader
    }
}


def _get_documents_from_global_config() -> list:
    '''
    Returns the list of document(s) from the config
    '''
    local_uri = config.document.local_uri
    loader = loaders.get(config.loader)['config']
    print("LOADER", loader)
    print()
    pdf_loader = loader(local_uri)
    documents = pdf_loader.load()
    return documents


def _get_qa_chain_for_pdf(llm: Ollama) -> BaseRetrievalQA:
    DB_PATH = "vectorstores/db/"
    print("config.embedding_id", config.embedding_id)
    embedding_object = embeddings.get(config.embedding_id)['class']
    vectorstore = Chroma(persist_directory=DB_PATH,
                         embedding_function=embedding_object())

    # Prompt
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

    qa_chain = RetrievalQA.from_chain_type(
        llm,
        retriever=vectorstore.as_retriever(),
        chain_type_kwargs={"prompt": QA_CHAIN_PROMPT},
        return_source_documents=False,
    )
    return qa_chain


def ask_bot_about_pdf(model: str, message: Message):
    id = str(uuid4())
    llm = get_llm(model)
    chain = _get_qa_chain_for_pdf(llm)
    documents = _get_documents_from_global_config()
    response = chain.run(input_documents=documents, query=message.prompt)
    return {"_id": id, "text": response, "user": users.get(model)}
