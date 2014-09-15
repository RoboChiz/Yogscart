// Shader created with Shader Forge Beta 0.36 
// Shader Forge (c) Joachim Holmer - http://www.acegikmo.com/shaderforge/
// Note: Manually altering this data may prevent you from opening it in Shader Forge
/*SF_DATA;ver:0.36;sub:START;pass:START;ps:flbk:,lico:1,lgpr:1,nrmq:1,limd:3,uamb:True,mssp:True,lmpd:False,lprd:False,enco:True,frtr:True,vitr:True,dbil:False,rmgx:True,rpth:0,hqsc:True,hqlp:False,tesm:0,blpr:0,bsrc:0,bdst:0,culm:0,dpts:2,wrdp:True,ufog:True,aust:True,igpj:False,qofs:0,qpre:2,rntp:3,fgom:False,fgoc:False,fgod:False,fgor:False,fgmd:0,fgcr:0.5,fgcg:0.5,fgcb:0.5,fgca:1,fgde:0.01,fgrn:0,fgrf:300,ofsf:0,ofsu:0,f2p0:False;n:type:ShaderForge.SFN_Final,id:1,x:32527,y:32648|diff-2-RGB,normal-14-RGB,emission-140-OUT,lwrap-233-OUT,amdfl-245-OUT,clip-2-A;n:type:ShaderForge.SFN_Tex2d,id:2,x:32894,y:32360,ptlb:Diffuse,ptin:_Diffuse,tex:61fdb98900b365f4b9166a01bf05f184,ntxv:0,isnm:False|UVIN-4-OUT;n:type:ShaderForge.SFN_TexCoord,id:3,x:33305,y:32360,uv:0;n:type:ShaderForge.SFN_Multiply,id:4,x:33107,y:32360|A-3-UVOUT,B-5-OUT;n:type:ShaderForge.SFN_Vector1,id:5,x:33305,y:32503,v1:1;n:type:ShaderForge.SFN_Cubemap,id:6,x:33004,y:32895,ptlb:Diffuse Cube,ptin:_DiffuseCube,cube:d929fbeda0fe3dd4fae62852303a4bba,pvfc:0|DIR-91-OUT;n:type:ShaderForge.SFN_Tex2d,id:14,x:33072,y:32605,ptlb:Normal,ptin:_Normal,tex:bc3c1a55775275b48aae99ac2759a566,ntxv:3,isnm:True;n:type:ShaderForge.SFN_NormalVector,id:91,x:33164,y:32895,pt:False;n:type:ShaderForge.SFN_Fresnel,id:138,x:33382,y:32685;n:type:ShaderForge.SFN_Multiply,id:140,x:33230,y:32748|A-138-OUT,B-188-OUT;n:type:ShaderForge.SFN_Multiply,id:165,x:33364,y:32981|A-2-RGB,B-210-OUT;n:type:ShaderForge.SFN_Slider,id:166,x:33364,y:33138,ptlb:Fresnel Strength,ptin:_FresnelStrength,min:0,cur:0,max:1;n:type:ShaderForge.SFN_Multiply,id:188,x:33218,y:33064|A-165-OUT,B-166-OUT;n:type:ShaderForge.SFN_ValueProperty,id:210,x:33546,y:33001,ptlb:Fresnel Color Multiplier,ptin:_FresnelColorMultiplier,glob:False,v1:1;n:type:ShaderForge.SFN_Vector3,id:233,x:32845,y:32770,v1:0.9558824,v2:0.2351897,v3:0.07028548;n:type:ShaderForge.SFN_Lerp,id:245,x:32784,y:32905|A-6-RGB,B-249-RGB,T-265-OUT;n:type:ShaderForge.SFN_NormalVector,id:247,x:33068,y:33160,pt:False;n:type:ShaderForge.SFN_Cubemap,id:249,x:32904,y:33174,ptlb:Diffuse Cube Indoor,ptin:_DiffuseCubeIndoor,cube:84a3e9a42d370ff409208389fd3c548e,pvfc:0|DIR-247-OUT;n:type:ShaderForge.SFN_ValueProperty,id:265,x:32904,y:33429,ptlb:In/OutIBL,ptin:_InOutIBL,glob:True,v1:1;proporder:2-6-14-166-210-249;pass:END;sub:END;*/

Shader "Shader Forge/YogscartCharacterShader" {
    Properties {
        _Diffuse ("Diffuse", 2D) = "white" {}
        _Normal ("Normal", 2D) = "bump" {}
        _DiffuseCube ("Diffuse Cube", Cube) = "_Skybox" {}
		_DiffuseCubeIndoor ("Diffuse Cube Indoor", Cube) = "_Skybox" {}
        _FresnelStrength ("Fresnel Strength", Range(0, 1)) = 0
        _FresnelColorMultiplier ("Fresnel Color Multiplier", Float ) = 1
        [HideInInspector]_Cutoff ("Alpha cutoff", Range(0,1)) = 0.5
    }
    SubShader {
        Tags {
            "Queue"="AlphaTest"
            "RenderType"="TransparentCutout"
        }
        Pass {
            Name "ForwardBase"
            Tags {
                "LightMode"="ForwardBase"
            }
            
            
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #define UNITY_PASS_FORWARDBASE
            #include "UnityCG.cginc"
            #include "AutoLight.cginc"
            #pragma multi_compile_fwdbase_fullshadows
            #pragma exclude_renderers xbox360 ps3 flash d3d11_9x 
            #pragma target 3.0
            uniform float4 _LightColor0;
            uniform sampler2D _Diffuse; uniform float4 _Diffuse_ST;
            uniform samplerCUBE _DiffuseCube;
            uniform sampler2D _Normal; uniform float4 _Normal_ST;
            uniform float _FresnelStrength;
            uniform float _FresnelColorMultiplier;
            uniform samplerCUBE _DiffuseCubeIndoor;
            uniform float _InOutIBL;
            struct VertexInput {
                float4 vertex : POSITION;
                float3 normal : NORMAL;
                float4 tangent : TANGENT;
                float2 texcoord0 : TEXCOORD0;
            };
            struct VertexOutput {
                float4 pos : SV_POSITION;
                float2 uv0 : TEXCOORD0;
                float4 posWorld : TEXCOORD1;
                float3 normalDir : TEXCOORD2;
                float3 tangentDir : TEXCOORD3;
                float3 binormalDir : TEXCOORD4;
                LIGHTING_COORDS(5,6)
            };
            VertexOutput vert (VertexInput v) {
                VertexOutput o;
                o.uv0 = v.texcoord0;
                o.normalDir = mul(float4(v.normal,0), _World2Object).xyz;
                o.tangentDir = normalize( mul( _Object2World, float4( v.tangent.xyz, 0.0 ) ).xyz );
                o.binormalDir = normalize(cross(o.normalDir, o.tangentDir) * v.tangent.w);
                o.posWorld = mul(_Object2World, v.vertex);
                o.pos = mul(UNITY_MATRIX_MVP, v.vertex);
                TRANSFER_VERTEX_TO_FRAGMENT(o)
                return o;
            }
            fixed4 frag(VertexOutput i) : COLOR {
                i.normalDir = normalize(i.normalDir);
                float3x3 tangentTransform = float3x3( i.tangentDir, i.binormalDir, i.normalDir);
                float3 viewDirection = normalize(_WorldSpaceCameraPos.xyz - i.posWorld.xyz);
/////// Normals:
                float2 node_281 = i.uv0;
                float3 normalLocal = UnpackNormal(tex2D(_Normal,TRANSFORM_TEX(node_281.rg, _Normal))).rgb;
                float3 normalDirection =  normalize(mul( normalLocal, tangentTransform )); // Perturbed normals
                float2 node_4 = (i.uv0.rg*1.0);
                float4 node_2 = tex2D(_Diffuse,TRANSFORM_TEX(node_4, _Diffuse));
                clip(node_2.a - 0.5);
                float3 lightDirection = normalize(_WorldSpaceLightPos0.xyz);
////// Lighting:
                float attenuation = LIGHT_ATTENUATION(i);
                float3 attenColor = attenuation * _LightColor0.xyz;
                float Pi = 3.141592654;
                float InvPi = 0.31830988618;
/////// Diffuse:
                float NdotL = dot( normalDirection, lightDirection );
                float3 w = float3(0.9558824,0.2351897,0.07028548)*0.5; // Light wrapping
                float3 NdotLWrap = NdotL * ( 1.0 - w );
                float3 forwardLight = max(float3(0.0,0.0,0.0), NdotLWrap + w );
                float3 diffuse = forwardLight/(Pi*(dot(w,float3(0.3,0.59,0.11))+1)) * attenColor + UNITY_LIGHTMODEL_AMBIENT.rgb;
////// Emissive:
                float3 emissive = ((1.0-max(0,dot(normalDirection, viewDirection)))*((node_2.rgb*_FresnelColorMultiplier)*_FresnelStrength));
                float3 finalColor = 0;
                float3 diffuseLight = diffuse;
                diffuseLight += lerp(texCUBE(_DiffuseCube,i.normalDir).rgb,texCUBE(_DiffuseCubeIndoor,i.normalDir).rgb,_InOutIBL); // Diffuse Ambient Light
                finalColor += diffuseLight * node_2.rgb;
                finalColor += emissive;
/// Final Color:
                return fixed4(finalColor,1);
            }
            ENDCG
        }
        Pass {
            Name "ForwardAdd"
            Tags {
                "LightMode"="ForwardAdd"
            }
            Blend One One
            
            
            Fog { Color (0,0,0,0) }
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #define UNITY_PASS_FORWARDADD
            #include "UnityCG.cginc"
            #include "AutoLight.cginc"
            #pragma multi_compile_fwdadd_fullshadows
            #pragma exclude_renderers xbox360 ps3 flash d3d11_9x 
            #pragma target 3.0
            uniform float4 _LightColor0;
            uniform sampler2D _Diffuse; uniform float4 _Diffuse_ST;
            uniform sampler2D _Normal; uniform float4 _Normal_ST;
            uniform float _FresnelStrength;
            uniform float _FresnelColorMultiplier;
            struct VertexInput {
                float4 vertex : POSITION;
                float3 normal : NORMAL;
                float4 tangent : TANGENT;
                float2 texcoord0 : TEXCOORD0;
            };
            struct VertexOutput {
                float4 pos : SV_POSITION;
                float2 uv0 : TEXCOORD0;
                float4 posWorld : TEXCOORD1;
                float3 normalDir : TEXCOORD2;
                float3 tangentDir : TEXCOORD3;
                float3 binormalDir : TEXCOORD4;
                LIGHTING_COORDS(5,6)
            };
            VertexOutput vert (VertexInput v) {
                VertexOutput o;
                o.uv0 = v.texcoord0;
                o.normalDir = mul(float4(v.normal,0), _World2Object).xyz;
                o.tangentDir = normalize( mul( _Object2World, float4( v.tangent.xyz, 0.0 ) ).xyz );
                o.binormalDir = normalize(cross(o.normalDir, o.tangentDir) * v.tangent.w);
                o.posWorld = mul(_Object2World, v.vertex);
                o.pos = mul(UNITY_MATRIX_MVP, v.vertex);
                TRANSFER_VERTEX_TO_FRAGMENT(o)
                return o;
            }
            fixed4 frag(VertexOutput i) : COLOR {
                i.normalDir = normalize(i.normalDir);
                float3x3 tangentTransform = float3x3( i.tangentDir, i.binormalDir, i.normalDir);
                float3 viewDirection = normalize(_WorldSpaceCameraPos.xyz - i.posWorld.xyz);
/////// Normals:
                float2 node_282 = i.uv0;
                float3 normalLocal = UnpackNormal(tex2D(_Normal,TRANSFORM_TEX(node_282.rg, _Normal))).rgb;
                float3 normalDirection =  normalize(mul( normalLocal, tangentTransform )); // Perturbed normals
                float2 node_4 = (i.uv0.rg*1.0);
                float4 node_2 = tex2D(_Diffuse,TRANSFORM_TEX(node_4, _Diffuse));
                clip(node_2.a - 0.5);
                float3 lightDirection = normalize(lerp(_WorldSpaceLightPos0.xyz, _WorldSpaceLightPos0.xyz - i.posWorld.xyz,_WorldSpaceLightPos0.w));
////// Lighting:
                float attenuation = LIGHT_ATTENUATION(i);
                float3 attenColor = attenuation * _LightColor0.xyz;
                float Pi = 3.141592654;
                float InvPi = 0.31830988618;
/////// Diffuse:
                float NdotL = dot( normalDirection, lightDirection );
                float3 w = float3(0.9558824,0.2351897,0.07028548)*0.5; // Light wrapping
                float3 NdotLWrap = NdotL * ( 1.0 - w );
                float3 forwardLight = max(float3(0.0,0.0,0.0), NdotLWrap + w );
                float3 diffuse = forwardLight/(Pi*(dot(w,float3(0.3,0.59,0.11))+1)) * attenColor;
                float3 finalColor = 0;
                float3 diffuseLight = diffuse;
                finalColor += diffuseLight * node_2.rgb;
/// Final Color:
                return fixed4(finalColor * 1,0);
            }
            ENDCG
        }
        Pass {
            Name "ShadowCollector"
            Tags {
                "LightMode"="ShadowCollector"
            }
            
            Fog {Mode Off}
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #define UNITY_PASS_SHADOWCOLLECTOR
            #define SHADOW_COLLECTOR_PASS
            #include "UnityCG.cginc"
            #include "Lighting.cginc"
            #pragma fragmentoption ARB_precision_hint_fastest
            #pragma multi_compile_shadowcollector
            #pragma exclude_renderers xbox360 ps3 flash d3d11_9x 
            #pragma target 3.0
            uniform sampler2D _Diffuse; uniform float4 _Diffuse_ST;
            struct VertexInput {
                float4 vertex : POSITION;
                float2 texcoord0 : TEXCOORD0;
            };
            struct VertexOutput {
                V2F_SHADOW_COLLECTOR;
                float2 uv0 : TEXCOORD5;
            };
            VertexOutput vert (VertexInput v) {
                VertexOutput o;
                o.uv0 = v.texcoord0;
                o.pos = mul(UNITY_MATRIX_MVP, v.vertex);
                TRANSFER_SHADOW_COLLECTOR(o)
                return o;
            }
            fixed4 frag(VertexOutput i) : COLOR {
                float2 node_4 = (i.uv0.rg*1.0);
                float4 node_2 = tex2D(_Diffuse,TRANSFORM_TEX(node_4, _Diffuse));
                clip(node_2.a - 0.5);
                SHADOW_COLLECTOR_FRAGMENT(i)
            }
            ENDCG
        }
        Pass {
            Name "ShadowCaster"
            Tags {
                "LightMode"="ShadowCaster"
            }
            Cull Off
            Offset 1, 1
            
            Fog {Mode Off}
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #define UNITY_PASS_SHADOWCASTER
            #include "UnityCG.cginc"
            #include "Lighting.cginc"
            #pragma fragmentoption ARB_precision_hint_fastest
            #pragma multi_compile_shadowcaster
            #pragma exclude_renderers xbox360 ps3 flash d3d11_9x 
            #pragma target 3.0
            uniform sampler2D _Diffuse; uniform float4 _Diffuse_ST;
            struct VertexInput {
                float4 vertex : POSITION;
                float2 texcoord0 : TEXCOORD0;
            };
            struct VertexOutput {
                V2F_SHADOW_CASTER;
                float2 uv0 : TEXCOORD1;
            };
            VertexOutput vert (VertexInput v) {
                VertexOutput o;
                o.uv0 = v.texcoord0;
                o.pos = mul(UNITY_MATRIX_MVP, v.vertex);
                TRANSFER_SHADOW_CASTER(o)
                return o;
            }
            fixed4 frag(VertexOutput i) : COLOR {
                float2 node_4 = (i.uv0.rg*1.0);
                float4 node_2 = tex2D(_Diffuse,TRANSFORM_TEX(node_4, _Diffuse));
                clip(node_2.a - 0.5);
                SHADOW_CASTER_FRAGMENT(i)
            }
            ENDCG
        }
    }
    FallBack "Diffuse"
    CustomEditor "ShaderForgeMaterialInspector"
}
