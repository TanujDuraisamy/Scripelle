import fetch from 'node-fetch';

export const deepseekController = async(req,res)=>{
    try{
        const promtptMessages = req.body.messages;

        const response = await fetch("https://deepseek-v31.p.rapidapi.com/",{
            method : 'POST',
            headers:{
                'Content-Type':'application/json',
                'x-rapidapi-host':'deepseek-v31.p.rapidapi.com',
                'x-rapidapi-key':process.env.RAPID_API_KEY
            },
            body :JSON.stringify({
                model:'deepseek-v3',
                messages: promtptMessages
            })
        });

        const data = await response.json();
        res.json(data);


    }catch(Error){
        console.error(`Deepseek Api error,${Error}`)
        res.status(500).json({error:'Failed to fetch from Deepseek Api'});
    }
}