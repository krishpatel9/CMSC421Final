This Github Contains all of our code for the CMSC421 Final Project Spring 2024. 

This Repository is split up into two sections: The Frontend and Backend

  Frontend:         The Frontend is a React JS project that is currently hosted on AWS using a S3 bucket. 
                    This can be accessed at the link : [http://text-summarizer-bucket.s3-website-us-east-1.amazonaws.com/](url)

  Backend: We have two files for the backend, make_model.py and app.py
  
      make_model.py:    In this file, we preprocess the text data, tokenize it, and train a Word2Vec 
                        model. This model is then saved in the directory as word2vec.kvmodel
      
      app.py:           This file, we load the model saved by make_model. This file preprocesses text, 
                        computes sentence embeddings using a loaded Word2Vec model, and applies TextRank 
                        algorithm for summarization. It also leverages Flask to serve an API that performs 
                        text summarization and keyword extraction from provided text or URL. This is hosted
                        on AWS currently using an EC2 instance, so our frontend is able to make API calls to it.

