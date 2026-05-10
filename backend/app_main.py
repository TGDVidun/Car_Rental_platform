from fastapi import FastAPI, Depends, HTTPException, status
import logging
import os

app = FastAPI(title="RentX Minimal Test")

@app.get("/")
def read_root():
    return {"message": "MINIMAL TEST SUCCESS"}

@app.get("/ping-test")
def ping_test():
    return {"message": "PING SUCCESS"}
