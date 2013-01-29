<%@page import="com.kendoui.spring.models.Category"%>
<%@taglib prefix="kendo" uri="http://www.kendoui.com/jsp/tags"%>
<%@taglib prefix="demo" tagdir="/WEB-INF/tags"%>

<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:url value="/web/grid/editing-custom/create" var="createUrl" />
<c:url value="/web/grid/editing-custom/read" var="readUrl" />
<c:url value="/web/grid/editing-custom/update" var="updateUrl" />
<c:url value="/web/grid/editing-custom/destroy" var="destroyUrl" />
<c:url value="/web/grid/editing-custom/categories" var="categoriesUrl" />

<demo:header />
    <kendo:grid name="grid" pageable="true" sortable="true" scrollable="true" editable="true" height="430px">
        <kendo:grid-toolbar>
            <kendo:grid-toolbarItem name="create"/>
            <kendo:grid-toolbarItem name="save"/>
            <kendo:grid-toolbarItem name="cancel"/>
        </kendo:grid-toolbar>
        <kendo:grid-columns>
            <kendo:grid-column title="Product Name" field="productName" />
            <kendo:grid-column title="Category" field="category" editor="categoryDropDownEditor" template="#=category.categoryName#"
            	width="160px"  />
            <kendo:grid-column title="Unit Price" field="unitPrice" format="{0:c}" width="120px" />
            <kendo:grid-column command="destroy" title="&nbsp;" width="120px" />
        </kendo:grid-columns>
        <kendo:dataSource pageSize="20" batch="true">
            <kendo:dataSource-transport>
                <kendo:dataSource-transport-create url="${createUrl}" dataType="json" type="POST" contentType="application/json" />
                <kendo:dataSource-transport-read url="${readUrl}" dataType="json" type="POST" contentType="application/json" />
                <kendo:dataSource-transport-update url="${updateUrl}" dataType="json" type="POST" contentType="application/json" />
                <kendo:dataSource-transport-destroy url="${destroyUrl}" dataType="json" type="POST" contentType="application/json" />
                <kendo:dataSource-transport-parameterMap>
                	<script>
	                	function parameterMap(options,type) { 
	                		if(type==="read"){
	                			return JSON.stringify(options);
	                		} else {
	                			return JSON.stringify(options.models);
	                		}
	                	}
                	</script>
                </kendo:dataSource-transport-parameterMap>
            </kendo:dataSource-transport>
            <kendo:dataSource-schema>
                <kendo:dataSource-schema-model id="productId">
                    <kendo:dataSource-schema-model-fields>
	                    <kendo:dataSource-schema-model-field name="productId" type="number" editable="false" />
                        <kendo:dataSource-schema-model-field name="productName" type="string">
                        	<kendo:dataSource-schema-model-field-validation required="true" />
                        </kendo:dataSource-schema-model-field>
                        <kendo:dataSource-schema-model-field name="unitPrice" type="number">
                        	<kendo:dataSource-schema-model-field-validation required="true" min="1" />
                        </kendo:dataSource-schema-model-field>                       
                        <kendo:dataSource-schema-model-field name="category" defaultValue="${defaultCategory}" />
                    </kendo:dataSource-schema-model-fields>
                </kendo:dataSource-schema-model>
            </kendo:dataSource-schema>
        </kendo:dataSource>
    </kendo:grid> 
<demo:footer />

<script>
	function categoryDropDownEditor(container, options) {
		$('<input data-text-field="categoryName" data-value-field="categoryId" data-bind="value:' + options.field + '"/>')
        .appendTo(container)
        .kendoDropDownList({
            autoBind: false,
            dataSource: {                
                transport: {
                    read: "${categoriesUrl}"
                }
            }
        });
	}
</script>