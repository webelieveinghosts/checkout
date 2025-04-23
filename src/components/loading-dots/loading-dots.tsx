import s from './loading-dots.module.css';

// eslint-disable-next-line react/display-name, import/no-anonymous-default-export
export default ({ className }: { className?: string }) => (
    <span className={`${s.root} ${className}`}>
        <span />
        <span />
        <span />
    </span>
)