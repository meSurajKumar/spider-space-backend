import express from 'express';
import cors from 'cors';

export default function(app){
    app.use(express.json());
    app.use(cors({
        origin : '*',
        credentials : true
    }));
}