function loadShader(shaderType)
{
    return $("#"+shaderType).text();
}

var timeUniform = { time: { type: 'f', value: 0.0 } };

function createCustomMaterialFromGLSLCode(fragmentName)
{
    var fragment = loadShader(fragmentName);
    var vertex = loadShader("vertex");
    var shaderMaterial = new THREE.ShaderMaterial({vertexShader: vertex, fragmentShader: fragment});
    return shaderMaterial;
}

//Duplicate with uniform creation to test update
function createCustomMaterialFromGLSLCodeWithUniforms(fragmentName)
{   
    var fragment = loadShader(fragmentName);
    var vertex = loadShader("vertex");
    var intensityUniforms = { ri: {type: 'f', value: 0.0 }, gi: { type: 'f', value: 0.0 }, bi: { type: 'f', value: 0.0 } };
	var material = new THREE.ShaderMaterial({uniforms:intensityUniforms,vertexShader:vertex,fragmentShader:fragment});
    return material;
}