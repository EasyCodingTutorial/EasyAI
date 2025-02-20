"use client"
import React, { useState } from 'react'

import styles from './ChatRoom.module.css'

interface Props{
    onSubmit: (text:string) => void;
}

export const ChatInput:React.FC<Props> = ({onSubmit}) => {
    const [inputValue, setInputValue] = useState<string>('')

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) =>{
    event.preventDefault()

     if(inputValue.trim()){
        onSubmit(inputValue)
        setInputValue('')
     }
    }


  return (
    <div className={styles.ChatInput}>
        <form
          onSubmit={handleSubmit}
         >
            <textarea
              required
              id='Inputbox'
              placeholder='Ask Anything...'
              value={inputValue}
              className={styles.TextArea}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type='submit' className={styles.SendBtn}>↪</button>
        </form>
    </div>
  )
}
