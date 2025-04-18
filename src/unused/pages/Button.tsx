import ButtonItem from '../components/ButtonItem.tsx';

export default function Button() {
  return (
    <div>
      <h1 className="text-xl font-medium mb-4">Solid Buttons</h1>
      <div className="flex flex-wrap gap-2">
        <ButtonItem classnames="btn-primary" content="Primary" />
        <ButtonItem classnames="btn-info" content="Info" />
        <ButtonItem classnames="btn-success" content="Success" />
        <ButtonItem classnames="btn-warning" content="Warning" />
        <ButtonItem classnames="btn-error" content="Error" />
      </div>

      <h1 className="text-xl font-medium mb-4 mt-6">Soft Buttons</h1>
      <div className="flex flex-wrap gap-2">
        <ButtonItem classnames="btn-soft btn-primary" content="Primary" />
        <ButtonItem classnames="btn-soft btn-info" content="Info" />
        <ButtonItem classnames="btn-soft btn-success" content="Success" />
        <ButtonItem classnames="btn-soft btn-warning" content="Warning" />
        <ButtonItem classnames="btn-soft btn-error" content="Error" />
      </div>
      <h1 className="text-xl font-medium mb-4 mt-6">Outline Buttons</h1>
      <div className="flex flex-wrap gap-2">
        <ButtonItem classnames="btn-outline btn-primary" content="Primary" />
        <ButtonItem classnames="btn-outline btn-info" content="Info" />
        <ButtonItem classnames="btn-outline btn-success" content="Success" />
        <ButtonItem classnames="btn-outline btn-warning" content="Warning" />
        <ButtonItem classnames="btn-outline btn-error" content="Error" />
      </div>
      <h1 className="text-xl font-medium mb-4 mt-6">Text Buttons</h1>
      <div className="flex flex-wrap gap-2">
        <ButtonItem classnames="btn-text btn-primary" content="Primary" />
        <ButtonItem classnames="btn-text btn-info" content="Info" />
        <ButtonItem classnames="btn-text btn-success" content="Success" />
        <ButtonItem classnames="btn-text btn-warning" content="Warning" />
        <ButtonItem classnames="btn-text btn-error" content="Error" />
      </div>
      <h1 className="text-xl font-medium mb-4 mt-6">Gradient Buttons</h1>
      <div className="flex flex-wrap gap-2">
        <ButtonItem classnames="btn-gradient btn-primary" content="Primary" />
        <ButtonItem classnames="btn-gradient btn-info" content="Info" />
        <ButtonItem classnames="btn-gradient btn-success" content="Success" />
        <ButtonItem classnames="btn-gradient btn-warning" content="Warning" />
        <ButtonItem classnames="btn-gradient btn-error" content="Error" />
      </div>
    </div>
  );
}
