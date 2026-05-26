import { useForm } from '@inertiajs/react';
import { useState } from 'react';

import {
    FiMail,
    FiEye,
    FiEyeOff,
    FiBriefcase,
    FiUsers
} from 'react-icons/fi';

export default function Login({ status, canResetPassword }) {

    const {
        data,
        setData,
        post,
        processing,
        errors
    } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword,setShowPassword]=useState(false);

    const submit=(e)=>{
        e.preventDefault();
        post(route('login'));
    };

    return (

<div
className="
min-h-screen
flex
items-center
justify-center
p-6
relative
"
style={{
background:"#FFF9D2",
fontFamily:"DM Sans"
}}
>

<style>{`

@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');

*{
font-family:'DM Sans',sans-serif;
}

.hero-title{
font-family:'Sora',sans-serif;
}

.input-field{
width:100%;
padding:12px 44px 12px 16px;
border:1.5px solid #e2e8f0;
border-radius:12px;
font-size:14px;
outline:none;
transition:.3s;
background:white;
}

.input-field:focus{
border-color:#BFDDF0;
box-shadow:0 0 0 4px rgba(191,221,240,.3);
}

.btn-login{
width:100%;
padding:14px;
border-radius:12px;
border:none;
font-weight:600;
cursor:pointer;
background:#BFDDF0;
color:#1a3a52;
transition:.3s;
}

.btn-login:hover:not(:disabled){
transform:translateY(-2px);
background:#a7d1ea;
box-shadow:0 10px 25px rgba(191,221,240,.4);
}

.btn-login:disabled{
opacity:.6;
cursor:not-allowed;
}

`}</style>


<div className="
w-full
max-w-5xl
bg-white
rounded-[30px]
overflow-hidden
shadow-xl
grid
md:grid-cols-2
">

{/* LEFT */}

<div
className="
hidden
md:flex
flex-col
justify-between
p-10
"
style={{
background:
'linear-gradient(135deg,#BFDDF0 0%,#a5d0eb 100%)'
}}
>

<div>

<div
className="
w-20
h-20
rounded-2xl
bg-white/30
flex
items-center
justify-center
mb-8
"
>

<FiBriefcase
size={34}
className="text-slate-700"
/>

</div>


<div
className="
bg-[#FFEBCC]
rounded-3xl
h-[230px]
flex
items-center
justify-center
mb-8
"
>

<div className="text-center">

<div className="
w-20
h-20
mx-auto
rounded-2xl
bg-white
flex
items-center
justify-center
mb-4
">

<FiUsers
size={36}
className="
text-[#2d6a9f]
"
/>

</div>

<p className="
font-semibold
text-amber-700
">

Your Team, Managed

</p>

</div>

</div>

</div>

<div>

<h2 className="
hero-title
text-3xl
font-bold
text-slate-800
mb-3
">

Manage people,<br/>
not just data.

</h2>

<p className="
text-slate-600
leading-relaxed
">

Experience a modern HR platform
built to simplify attendance and
empower your workforce.

</p>

</div>

</div>



{/* RIGHT */}

<div className="
p-10
flex
items-center
justify-center
">

<div className="
w-full
max-w-sm
">

<h1 className="
hero-title
text-3xl
font-bold
text-slate-800
mb-2
">

HumaneHR

</h1>

<p className="
text-slate-500
mb-8
">

Welcome back! Login to continue.

</p>


{status && (

<div className="
mb-5
bg-green-50
text-green-700
p-3
rounded-xl
text-sm
">

{status}

</div>

)}

<form
onSubmit={submit}
className="space-y-5"
>

{/* EMAIL */}

<div>

<label className="
block
text-sm
font-medium
mb-2
">

Work Email

</label>

<div className="relative">

<input
type="email"
className="input-field"
placeholder="name@company.com"
value={data.email}
onChange={(e)=>
setData(
'email',
e.target.value
)
}
required
/>

<FiMail
size={18}
className="
absolute
right-4
top-1/2
-translate-y-1/2
text-slate-400
"
/>

</div>

{errors.email&&(
<p className="
text-red-500
text-xs
mt-1
">
{errors.email}
</p>
)}

</div>


{/* PASSWORD */}

<div>

<div className="
flex
justify-between
mb-2
">

<label className="
text-sm
font-medium
">

Password

</label>

{canResetPassword&&(

<a
href={route(
'password.request'
)}
className="
text-xs
text-blue-500
hover:underline
"
>

Forgot password?

</a>

)}

</div>

<div className="relative">

<input
type={
showPassword
?
'text'
:
'password'
}
className="input-field"
placeholder="••••••••"
value={data.password}
onChange={(e)=>
setData(
'password',
e.target.value
)
}
required
/>

<button
type="button"
onClick={()=>
setShowPassword(
!showPassword
)
}
className="
absolute
right-4
top-1/2
-translate-y-1/2
text-slate-400
"
>

{
showPassword
?
<FiEyeOff size={18}/>
:
<FiEye size={18}/>
}

</button>

</div>

{errors.password&&(
<p className="
text-red-500
text-xs
mt-1
">
{errors.password}
</p>
)}

</div>


<label className="
flex
items-center
gap-3
cursor-pointer
">

<input
type="checkbox"
checked={data.remember}
onChange={(e)=>
setData(
'remember',
e.target.checked
)
}
style={{
accentColor:"#BFDDF0"
}}
/>

<span className="
text-sm
text-slate-600
">

Remember me

</span>

</label>


<button
type="submit"
className="btn-login"
disabled={processing}
>

{
processing
?
'Logging in...'
:
'Login to Dashboard'
}

</button>

</form>

</div>

</div>

</div>


<footer className="
absolute
bottom-4
left-0
right-0
text-center
text-xs
text-slate-400
">

© 2024 HumaneHR SaaS. Designed for people.

</footer>

</div>

);

}