import{j as e,a as x}from"./emotion-react-jsx-runtime.browser.esm-DaIQf7lP.js";import"./iframe-D-Zi2FPS.js";import{F as r,a as b,b as S,c as y}from"./FormField-Df57juGd.js";import"./jsx-runtime-Dbp9ZD_N.js";import"./preload-helper-C1FmrZbK.js";import"./index-DmvW-Az5.js";const A={title:"Design System/FormField",component:r,tags:["autodocs"]},o={render:()=>e(r,{label:"Proof Name",children:e(b,{placeholder:"Triangle congruence proof"})})},a={render:()=>e(r,{label:"Semantic Model",helpText:"Choose the consensus adapter for analysis.",children:x(y,{children:[e("option",{value:"atlas-1",children:"Atlas-1"}),e("option",{value:"orion-2",children:"Orion-2"})]})})},t={render:()=>e(r,{label:"Proof Draft",errorMessage:"Proof cannot be empty.",children:e(S,{rows:4,placeholder:"Enter your proof..."})})},n={render:()=>e(r,{label:"Token Budget",density:"compact",children:e(b,{type:"number",value:4096,min:1024,max:8192})})};var s,l,c;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: () => <FormField label="Proof Name">
      <FormFieldInput placeholder="Triangle congruence proof" />
    </FormField>
}`,...(c=(l=o.parameters)==null?void 0:l.docs)==null?void 0:c.source}}};var i,m,d;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => <FormField label="Semantic Model" helpText="Choose the consensus adapter for analysis.">
      <FormFieldSelect>
        <option value="atlas-1">Atlas-1</option>
        <option value="orion-2">Orion-2</option>
      </FormFieldSelect>
    </FormField>
}`,...(d=(m=a.parameters)==null?void 0:m.docs)==null?void 0:d.source}}};var p,u,F;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <FormField label="Proof Draft" errorMessage="Proof cannot be empty.">
      <FormFieldTextArea rows={4} placeholder="Enter your proof..." />
    </FormField>
}`,...(F=(u=t.parameters)==null?void 0:u.docs)==null?void 0:F.source}}};var f,h,g;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <FormField label="Token Budget" density="compact">
      <FormFieldInput type="number" value={4096} min={1024} max={8192} />
    </FormField>
}`,...(g=(h=n.parameters)==null?void 0:h.docs)==null?void 0:g.source}}};const C=["DefaultInput","WithHelpText","ErrorState","Compact"];export{n as Compact,o as DefaultInput,t as ErrorState,a as WithHelpText,C as __namedExportsOrder,A as default};
