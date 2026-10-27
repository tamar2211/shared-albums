import { useState } from "react";
import { useDropzone } from "react-dropzone";

type UploadTileProps = {
    onFiles: (files: File[]) => void;
    disabled?: boolean;
};

function UploadTile({ onFiles, disabled = false }: UploadTileProps) {
    const [message, setMessage] = useState<string | null>(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDropAccepted: (files) => {
            setMessage(null);
            onFiles(files);
        },
        onDropRejected: (rejections) => {
            const tooMany = rejections.some((r) =>
                r.errors.some((e) => e.code === "too-many-files")
            );
            setMessage(tooMany ? "אפשר לבחור עד 500 תמונות בכל פעם" : "קבצים שאינם תמונות לא נוספו");
        },
        accept: { "image/*": [] },
        maxFiles: 500,
        disabled,
    });

    const label = disabled ? "ממתין לסיום ההעלאה" : isDragActive ? "שחררו כאן" : "הוספת תמונות";

    return (
        <>
            <div {...getRootProps()} aria-disabled={disabled}>
                <input {...getInputProps()} />
                <span aria-hidden="true">+</span>
                <span>{label}</span>
            </div>
            {message && <p>{message}</p>}
        </>
    );
}

export default UploadTile;