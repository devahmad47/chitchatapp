import { Box, Button, Container, HStack, Input, VStack } from '@chakra-ui/react';
import { signOut, onAuthStateChanged, getAuth,  GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import Message from './components/Message';
import { app } from './components/firebase';
import { useEffect, useState, useRef } from 'react';
import { getFirestore, addDoc, collection, serverTimestamp, onSnapshot, query, orderBy, scrollIntoView } from 'firebase/firestore';
import { async } from '@firebase/util'; 
const auth = getAuth(app);
const db = getFirestore(app)
const loginHandler =()=>{
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth,provider)
};
const logoutHandler =()=> signOut(auth);

function App() {
 
  const [user,setUser] = useState(false)
  const [message,setMessage]=useState('');
  const [messages,setMessages]=useState([]);
  const divForScroll = useRef(null);
  const submitHandler= async (e) => {
    e.preventDefault();
    try {
      setMessage("");
      // divForScroll.current.scrollIntoView({behaviour:"smooth"});
      await addDoc(collection(db,"Messages"),{
        text:message,
        uid:user.uid,
        uri:user.photoURL,
        createdAt: serverTimestamp()
      });
      divForScroll.current.scrollIntoView({behaviour:"smooth"});
    } 
    catch (error) 
    {
      alert(error);
    }
    };
    
 useEffect(()=>{
  const q = query(collection(db, "Messages"), orderBy("createdAt","asc"));
  const unsubscribe = onAuthStateChanged(auth,(data)=>{
    setUser(data);
  });
  const unsubscribeForMessage = onSnapshot(q, (snap)=>{
setMessages(
  (snap.docs.map((item) => {
  const id = item.id;
  return {id,...item. data()};
})
  )
);
    });
   
    return()=> {
      unsubscribe();
      unsubscribeForMessage();
    };
  },[]);
  return  <Box  backgroundColor={"pink"}>  
   {
    user?(
      <Container bgimg bg={"aqua"} h={"95vh"} border={"2px solid black"} marginTop={"20px"} >
      <VStack h="full" paddingY={4}>
 <Button onClick={logoutHandler} colorScheme={"blue"} w={"full"}>
   Logout
 </Button>
 <VStack h="full" width={"full"} overflowY={"auto"} css={{"&::-webkit-scrollbar":{
  display:"none",
 }}}>

  {messages.map((item) =>(
    <Message key={item.id}user={item.uid ===user.uid?"me":"other"} text={item.text} uri={item.uri} />
  ))}
  <div ref={divForScroll}></div>
 </VStack>
 
   <form  onSubmit={submitHandler}
   style={{width:"100%", backgroundColor:"aqua",}}>
 <HStack>
 <Input value={message} onChange={(e)=>setMessage(e.target.value)} placeholder='Type Your Message...' style={{border: "2px solid black"}} />
 <Button colorScheme={"facebook"} type="submit">Send</Button>
 </HStack>
 
 </form>
      </VStack>
     </Container>
    ):<VStack h={"100vh"} justifyContent={"center"}>
      <Button onClick={loginHandler}  colorScheme={"blue"}>
        Sign In With Google
      </Button>
    </VStack>
   }
  </Box>
  
}

export default App;
