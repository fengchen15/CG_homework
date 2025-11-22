#version 300 es
precision mediump float;

out vec4 FragColor;

uniform float ambientStrength, specularStrength, diffuseStrength,shininess;

in vec3 Normal;//法向量
in vec3 FragPos;//相机观察的片元位置
in vec2 TexCoord;//纹理坐标
in vec4 FragPosLightSpace;//光源观察的片元位置

uniform vec3 viewPos;//相机位置
uniform vec4 u_lightPosition; //光源位置	
uniform vec3 lightColor;//入射光颜色

uniform sampler2D diffuseTexture;
uniform sampler2D depthTexture;
uniform samplerCube cubeSampler;//盒子纹理采样器


float shadowCalculation(vec4 fragPosLightSpace, vec3 normal, vec3 lightDir)
{
    float shadow=0.0;  //非阴影
    /*TODO3: 添加阴影计算，返回1表示是阴影，返回0表示非阴影*/
    
    // 执行透视除法，将坐标转换到[-1,1]范围
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    
    // 将坐标从[-1,1]映射到[0,1]范围
    projCoords = projCoords * 0.5 + 0.5;
    
    // 获取当前片元在光照空间中的深度
    float currentDepth = projCoords.z;
    
    // 添加偏移，避免阴影粉刺
    float bias = max(0.005 * (1.0 - dot(normal, lightDir)), 0.0005);
    
    // 从深度纹理中采样最近深度
    float closestDepth = texture(depthTexture, projCoords.xy).r;
    
    // 比较当前深度和最近深度，如果当前深度大于最近深度，说明在阴影中
    shadow = currentDepth > closestDepth + bias ? 1.0 : 0.0;
    
    // 处理超出光照范围的情况
    if(projCoords.z > 1.0)
        shadow = 0.0;
    
    return shadow;
   
}       

void main()
{
    
    //采样纹理颜色
    vec3 TextureColor = texture(diffuseTexture, TexCoord).xyz;

    //计算光照颜色
 	vec3 norm = normalize(Normal);
	vec3 lightDir;
	if(u_lightPosition.w==1.0) 
        lightDir = normalize(u_lightPosition.xyz - FragPos);
	else lightDir = normalize(u_lightPosition.xyz);
	vec3 viewDir = normalize(viewPos - FragPos);
	vec3 halfDir = normalize(viewDir + lightDir);


    /*TODO2:根据phong shading方法计算ambient,diffuse,specular*/
    // 声明光照变量
    vec3 ambient, diffuse, specular;
    
    // 环境光计算
    ambient = ambientStrength * lightColor;
    
    // 漫反射计算
    float diff = max(dot(norm, lightDir), 0.0);
    diffuse = diffuseStrength * diff * lightColor;
    
    // 镜面反射计算 - 使用半程向量方法
    float spec = pow(max(dot(norm, halfDir), 0.0), shininess);
    specular = specularStrength * spec * lightColor;
  
  	vec3 lightReflectColor=(ambient +diffuse + specular);

    //判定是否阴影，并对各种颜色进行混合
    float shadow = shadowCalculation(FragPosLightSpace, norm, lightDir);
	
    vec3 resultColor = (ambient + (1.0 - shadow) * (diffuse + specular)) * TextureColor;
    
    FragColor = vec4(resultColor, 1.f);
}


