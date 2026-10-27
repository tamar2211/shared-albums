type ProgressBarProps={
    value:number;
    max:number;
}
function ProgressBar({value,max}:ProgressBarProps)
{
    const percent = max > 0 ? (value / max) * 100 : 0;
    return (
    <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
    >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
);
}
export default ProgressBar;