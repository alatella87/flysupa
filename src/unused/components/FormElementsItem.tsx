export default function FormElementsItem() {
  return (
    <div>
      <h1 className="text-xl font-medium mb-4">Input</h1>

      <label className="form-control sm:w-96">
        <div className="label">
          <span className="label-text">Full Name</span>
        </div>
        <input type="text" placeholder="John Doe" className="input" />
        <div className="label">
          <span className="label-text-alt">Please write your full name</span>
        </div>
      </label>

      <h1 className="text-xl font-medium mb-4 mt-6">Radio</h1>

      <label className="form-control flex items-center gap-1">
        <input type="radio" name="radio-0" className="radio radio-primary" />
        <span className="label cursor-pointer">
          <span className="label-text text-base">Default</span>
        </span>
      </label>
      <label className="form-control flex items-center gap-1">
        <input
          type="radio"
          name="radio-0"
          className="radio radio-primary"
          defaultChecked
        />
        <span className="label cursor-pointer">
          <span className="label-text text-base">Checked</span>
        </span>
      </label>

      <h1 className="text-xl font-medium mb-4 mt-6">Checkbox</h1>

      <div className="flex items-center gap-2 mb-1.5">
        <input
          type="checkbox"
          className="checkbox checkbox-primary"
          id="check1"
        />
        <label className="label-text text-base" htmlFor="check1">
          Default
        </label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          className="checkbox checkbox-primary"
          id="check3"
          defaultChecked
        />
        <label className="label-text text-base" htmlFor="check3">
          Checked
        </label>
      </div>

      <h1 className="text-xl font-medium mb-4 mt-6">Switch</h1>

      <label className="form-control flex items-center gap-1">
        <input type="checkbox" className="switch switch-primary" />
        <span className="label cursor-pointer flex-col items-start">
          <span className="label-text text-base">Default</span>
        </span>
      </label>
      <label className="form-control flex items-center gap-1">
        <input
          type="checkbox"
          className="switch switch-primary"
          defaultChecked
        />
        <span className="label cursor-pointer flex-col items-start">
          <span className="label-text text-base">Checked</span>
        </span>
      </label>
    </div>
  );
}
