import classNames from 'classnames';

export default function ButtonItem(props: any) {
  const { classnames, content } = props;

  return <button className={classNames('btn', classnames)}>{content}</button>;
}
