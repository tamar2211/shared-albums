import { useState,useEffect} from "react";

type JoinLinkProps={
   joinCode:string;
   onRegenerate?: () => void;
}
function JoinLink({joinCode,onRegenerate}:JoinLinkProps)
{
    const link=`${window.location.origin}/join/${joinCode}`
    const [copied,setCopied]= useState(false);
    useEffect(() => {setCopied(false);}, [joinCode]);
    async function handleCopy()
    {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
   }
   function handleRegenerate()
    {
    if (window.confirm("ליצור קישור חדש? הקישור הנוכחי יפסיק לעבוד.")) {
        onRegenerate?.()
    }
    }
   return(
        <>
        <input readOnly value={link} />
                <button type="button" onClick={handleCopy}>
            {copied ? "הועתק!" : "העתק"}
        </button>
        {onRegenerate && (
            <button type="button" onClick={handleRegenerate}>
                קישור חדש
            </button>
              )}
        </>
    )
}
export default  JoinLink;