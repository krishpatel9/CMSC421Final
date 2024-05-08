import numpy as np
import re
from gensim.models import KeyedVectors
from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS
from newspaper import Article
import os
import collections

app = Flask(__name__)
CORS(app)


def pre_process(text):
    text = text.lower()
    text = re.sub("</?.*?>", " <> ", text)
    text = re.sub("'", "", text)  # e.g. i'm -> im
    text = re.sub("(\\d|\\W)+", " ", text)
    return text

def tokenize(text):
    tokens = []
    for i in text.split():
        if i in vocab:
            tokens.append(i)
        if i == '<s>':
            tokens.append(i)
    return tokens

# if not os.path.isfile('./word2vec.kvmodel'):
#     !wget 'https://raw.githubusercontent.com/FeiYuan5/Extractive-Text-Summarizer/main/word2vec.kvmodel' -O word2vec.kvmodel

embedding = KeyedVectors.load('word2vec.kvmodel')
vocab = set(embedding.index_to_key)  # set of unique words in embedding

def sentence_vectors(sentences):
    sv = []
    buffer = np.zeros(shape = 100)
    length = 0
    tokens = []
    new_s = []
    s = 0

    for i in sentences:  # first turn sentences to tokens
        tokens.append(tokenize(pre_process(i)))

    while s < len(tokens):  # then turn tokens to vectors
        for word in tokens[s]:
            if word in embedding:
                buffer += embedding[word]
                length += 1
        if length != 0:
            sv.append(buffer / length)
            new_s.append(sentences[s])
        buffer *= 0
        length = 0
        s += 1
    return np.array(sv), new_s

def cosine_similarity(vecs):
    dots = np.dot(vecs, vecs.T)
    imag = 1 / np.diag(dots)
    # in case of divide by zeroes, set inverse magnitude to 0
    imag[np.isinf(imag)] = 0
    imag = np.sqrt(imag)
    # multiply dots by inverse magnitude two ways to get cosine similarity
    cosine = dots * imag
    cosine = cosine.T * imag
    np.fill_diagonal(cosine, 0)  # don't need the diagonals, set them to 0
    return cosine

def text_rank(d, cos):
    n = cos.shape[0]
    tr = np.ones(n)
    for i in range(n):  # iter
        tr = (1 - d) + d * np.dot(tr, cos)
    return tr

def summarize(sentences, topn):
    index = []
    ret = ''
    for i, j in enumerate(sentences):
        if i in topn:
            ret += j + ' '
    return ret

def extract_main_content(url):
    article = Article(url)
    article.download()
    article.parse()
    return article.text

def simple_summarize(text=None, url=None, ratio=0.5):
    if url:
        text = extract_main_content(url)

    sentences = re.findall(r'\w+.*?[.?!]', text, flags=re.S)
    n = max(1, int(len(sentences) * ratio))

    sv, sentences = sentence_vectors(sentences)
    cos = cosine_similarity(sv)
    ncos = cos / cos.sum(axis=1, keepdims=True)
    tr = text_rank(0.85, ncos)

    i_rank = np.argsort(tr)[::-1]
    s_rank = [sentences[i] for i in i_rank]
    summary = summarize(sentences, i_rank[:n])
    return summary, s_rank

def get_keywords(text=None, url=None, n=10): # someone kill me
    if url:
        text = extract_main_content(url)

    words = re.findall(r'\w+.*?[.?! ]', pre_process(text), flags=re.S)
    words = [i.replace(' ', '') for i in words]
    cands = tokenize(pre_process(text))
    new_cands = []
    i, j = 0, 0
    while i < len(words) - 1:
        if words[i] == cands[j]:
            buffer = cands[j]
            new_cands.append(buffer)
            k = 1
            while i+k < len(words) and j+k < len(cands) and words[i+k] == cands[j+k]:
                buffer += ' ' + cands[j+k]
                new_cands.append(buffer)
                new_cands.append(cands[j+k])
                k += 1
            i += k
            j += k
        else: i += 1
    candidates = {i: j for i, j in collections.Counter(new_cands).items() if j > 1}
    filter = '.'.join(candidates.keys()) + '.'
    candidates = {i: j for i, j in candidates.items() if not (i+' ' in filter or ' '+i in filter or len(i)< 3)}
    keywords = sorted(candidates, key=candidates.get, reverse=True)
    return keywords[:n]

@app.route('/summarize', methods=['POST'])
def summarize_text():
    data = request.get_json()
    summary, sentence_ranking = simple_summarize(
        text=data.get('text'),
        url=data.get('url'),
        ratio=data['ratio']
    )
    return jsonify({"summary": summary})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)